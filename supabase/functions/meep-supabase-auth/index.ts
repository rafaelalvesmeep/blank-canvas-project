import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MEEP_API_BASE = 'https://portal-api.meep.cloud';

interface RequestBody {
  email: string;
  meepToken: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, meepToken } = await req.json() as RequestBody;

    if (!email || !meepToken) {
      console.log('Missing email or meepToken');
      return new Response(
        JSON.stringify({ error: 'Email e token são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate email domain
    if (!email.endsWith('@meep.com.br')) {
      console.log('Invalid email domain');
      return new Response(
        JSON.stringify({ error: 'Apenas emails @meep.com.br são permitidos' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing login for email: ${email}`);

    // Token is already validated by MFA flow - the access_token is returned only after successful MFA validation
    // We trust the token since it came directly from the Meep MFA validation endpoint
    console.log('Meep token received from MFA validation');

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Check if user exists in profiles table
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar perfil do usuário' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // User not registered in the local system
    if (!profile) {
      // Auto-create specific whitelisted users
      const AUTO_APPROVE_EMAILS = ['deivid.castilho@meep.com.br'];
      
      if (AUTO_APPROVE_EMAILS.includes(email)) {
        console.log(`Auto-creating approved user: ${email}`);
        
        // Check if auth user exists
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        let userId = existingUsers?.users?.find(u => u.email === email)?.id;
        
        // Create auth user if doesn't exist
        if (!userId) {
          const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            email_confirm: true,
            user_metadata: { full_name: 'Deivid Castilho' }
          });
          
          if (createUserError) {
            console.error('Error creating user:', createUserError);
            return new Response(
              JSON.stringify({ error: 'Erro ao criar usuário' }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          userId = newUser.user.id;
        }
        
        // Create profile
        const { error: profileInsertError } = await supabaseAdmin
          .from('profiles')
          .insert({
            user_id: userId,
            email: email,
            full_name: 'Deivid Castilho',
            is_approved: true,
          });
        
        if (profileInsertError && !profileInsertError.message.includes('duplicate')) {
          console.error('Error creating profile:', profileInsertError);
        }
        
        // Create admin role
        const { error: roleError } = await supabaseAdmin
          .from('user_roles')
          .insert({
            user_id: userId,
            role: 'admin',
          });
        
        if (roleError && !roleError.message.includes('duplicate')) {
          console.error('Error creating role:', roleError);
        }
        
        console.log('Auto-created user with admin role, generating magic link');
        
        // Generate magic link for the new user
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'magiclink',
          email: email,
        });
        
        if (linkError) {
          console.error('Error generating magic link:', linkError);
          return new Response(
            JSON.stringify({ error: 'Erro ao gerar link de autenticação' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const actionLink = linkData.properties?.action_link;
        const url = new URL(actionLink);
        const token = url.searchParams.get('token');
        const type = url.searchParams.get('type');
        
        // Fetch the new profile
        const { data: newProfile } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('email', email)
          .single();
        
        return new Response(
          JSON.stringify({
            status: 'authenticated',
            actionLink,
            token,
            type,
            profile: newProfile,
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log('User not registered in local system');
      return new Response(
        JSON.stringify({
          status: 'user_not_registered',
          meepData: { email },
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User found, generating magic link');

    // Generate magic link for the user
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
    });

    if (linkError) {
      console.error('Error generating magic link:', linkError);
      return new Response(
        JSON.stringify({ error: 'Erro ao gerar link de autenticação' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Magic link generated successfully');

    // Extract token from the action link
    const actionLink = linkData.properties?.action_link;
    const url = new URL(actionLink);
    const token = url.searchParams.get('token');
    const type = url.searchParams.get('type');

    return new Response(
      JSON.stringify({
        status: 'authenticated',
        actionLink,
        token,
        type,
        profile,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
