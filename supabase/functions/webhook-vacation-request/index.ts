import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface WebhookPayload {
  external_id: string;
  employee: {
    id: string;
    name: string;
    email: string;
    department: string;
  };
  vacation: {
    start_date: string;
    end_date: string;
    days_count: number;
    notes?: string;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // Validate webhook secret
    const webhookSecret = Deno.env.get("WEBHOOK_SECRET");
    const providedSecret = req.headers.get("x-webhook-secret");

    if (!webhookSecret || !providedSecret || webhookSecret !== providedSecret) {
      console.error("Invalid webhook secret");
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid webhook secret" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const payload: WebhookPayload = await req.json();

    // Validate required fields
    if (!payload.external_id) {
      return new Response(
        JSON.stringify({ error: "Missing required field: external_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!payload.employee?.id || !payload.employee?.name || !payload.employee?.email || !payload.employee?.department) {
      return new Response(
        JSON.stringify({ error: "Missing required employee fields: id, name, email, department" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!payload.vacation?.start_date || !payload.vacation?.end_date || !payload.vacation?.days_count) {
      return new Response(
        JSON.stringify({ error: "Missing required vacation fields: start_date, end_date, days_count" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check for duplicate external_id
    const { data: existing } = await supabase
      .from("vacation_requests")
      .select("id")
      .eq("external_id", payload.external_id)
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({ 
          error: "Duplicate request", 
          message: `A vacation request with external_id '${payload.external_id}' already exists`,
          existing_id: existing.id
        }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert vacation request
    const { data, error } = await supabase
      .from("vacation_requests")
      .insert({
        external_id: payload.external_id,
        employee_id: payload.employee.id,
        employee_name: payload.employee.name,
        employee_email: payload.employee.email,
        department: payload.employee.department,
        start_date: payload.vacation.start_date,
        end_date: payload.vacation.end_date,
        days_count: payload.vacation.days_count,
        notes: payload.vacation.notes || null,
        status: "pendente",
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to create vacation request", details: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Vacation request created:", data.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Vacation request created successfully",
        data: {
          id: data.id,
          external_id: data.external_id,
          status: data.status,
          created_at: data.created_at
        }
      }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: "Internal server error", details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
