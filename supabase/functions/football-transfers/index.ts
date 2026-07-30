const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "GET") {
    return Response.json({ error: "Method not allowed" }, {
      status: 405,
      headers: corsHeaders,
    });
  }

  const apiKey = Deno.env.get("RAPIDAPI_FOOTBALL_TRANSFERS_KEY");
  if (!apiKey) {
    return Response.json({ error: "API key not configured" }, {
      status: 500,
      headers: corsHeaders,
    });
  }

  try {
    const response = await fetch(
      "https://free-api-live-football-data.p.rapidapi.com/football-get-all-transfers?page=1",
      {
        headers: {
          "x-rapidapi-key": apiKey,
          "x-rapidapi-host": "free-api-live-football-data.p.rapidapi.com",
          "Content-Type": "application/json",
        },
      },
    );

    const responseText = await response.text();
    if (!response.ok) {
      console.error(`Football transfers API error: ${response.status}`, responseText);
      return Response.json({ error: "Unable to fetch football transfers" }, {
        status: response.status,
        headers: corsHeaders,
      });
    }

    return new Response(responseText, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (error) {
    console.error("Football transfers function failed:", error);
    return Response.json({ error: "Unable to fetch football transfers" }, {
      status: 502,
      headers: corsHeaders,
    });
  }
});
