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

  const apiKey = Deno.env.get("RAPIDAPI_FOOTBALL_NEWS_KEY");
  if (!apiKey) {
    return Response.json({ error: "API key not configured" }, {
      status: 500,
      headers: corsHeaders,
    });
  }

  try {
    const response = await fetch(
      "https://football-news11.p.rapidapi.com/api/news-by-league?league_id=52&lang=en&page=1",
      {
        method: "GET",
        headers: {
          "x-rapidapi-key": apiKey,
          "x-rapidapi-host": "football-news11.p.rapidapi.com",
          "Content-Type": "application/json",
        },
      },
    );

    const responseText = await response.text();
    if (!response.ok) {
      console.error(`Football news API error: ${response.status}`, responseText);
      return Response.json({ error: "Unable to fetch football news" }, {
        status: response.status,
        headers: corsHeaders,
      });
    }

    const parsed = JSON.parse(responseText);
    const payload = Array.isArray(parsed)
      ? parsed
      : (parsed.data || parsed.news || parsed.articles || []);
    const news = Array.isArray(payload)
      ? payload
      : (payload.news || payload.articles || []);

    return Response.json(news, {
      headers: {
        ...corsHeaders,
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (error) {
    console.error("Football news function failed:", error);
    return Response.json({ error: "Unable to fetch football news" }, {
      status: 502,
      headers: corsHeaders,
    });
  }
});
