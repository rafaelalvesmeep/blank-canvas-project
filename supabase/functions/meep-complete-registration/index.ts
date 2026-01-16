import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MEEP_API_BASE = 'https://portal-api.meep.cloud';

interface RequestBody {
  email: string;
  fullName: string;
  sector: string;
  meepToken: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, fullName, sector, meepToken } = await req.json() as RequestBody;

    if (!email || !fullName || !meepToken) {
      console.log('Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Email, nome completo e token são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing registration for email: ${email}`);

    // Validate Meep token
    const verifyResponse = await fetch(`${MEEP_API_BASE}/api/mfa/verify-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${meepToken}`,
      },
    });

    if (!verifyResponse.ok) {
      console.log('Meep token validation failed');
      return new Response(
        JSON.stringify({ error: 'Token Meep inválido ou expirado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Meep token validated successfully');

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

    // Check if user already exists
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (existingProfile) {
      console.log('User already exists');
      return new Response(
        JSON.stringify({ error: 'Usuário já cadastrado' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create user in Supabase Auth
    // Generate a random password since user will login via Meep MFA
    const randomPassword = crypto.randomUUID() + crypto.randomUUID();
    
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: randomPassword,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return new Response(
        JSON.stringify({ error: 'Erro ao criar usuário' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Auth user created successfully');

    // The handle_new_user trigger will create the profile automatically
    // Wait a moment for the trigger to execute
    await new Promise(resolve => setTimeout(resolve, 500));

    // Update the profile with the sector
    if (sector) {
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ 
          sector: [sector],
          full_name: fullName 
        })
        .eq('user_id', authUser.user.id);

      if (updateError) {
        console.error('Error updating profile sector:', updateError);
        // Don't fail the request, the profile was still created
      }
    }

    console.log('Profile updated with sector');

    // Generate magic link for automatic login
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
        status: 'registered',
        actionLink,
        token,
        type,
        userId: authUser.user.id,
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
