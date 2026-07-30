const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

type Provider = {
  host: string;
  keyName: string;
  baseUrl: string;
};

const providers: Record<string, Provider> = {
  footballPredictions: {
    host: "football-prediction-api.p.rapidapi.com",
    keyName: "RAPIDAPI_FOOTBALL_PREDICTIONS_KEY",
    baseUrl: "https://football-prediction-api.p.rapidapi.com/api/v2",
  },
  betigoloSample: {
    host: "betigolo-predictions.p.rapidapi.com",
    keyName: "RAPIDAPI_BETIGOLO_PREDICTIONS_KEY",
    baseUrl: "https://betigolo-predictions.p.rapidapi.com",
  },
  betigoloHistory: {
    host: "betigolo-tips.p.rapidapi.com",
    keyName: "RAPIDAPI_BETIGOLO_TIPS_KEY",
    baseUrl: "https://betigolo-tips.p.rapidapi.com",
  },
  sureBets: {
    host: "today-football-prediction.p.rapidapi.com",
    keyName: "RAPIDAPI_TODAY_FOOTBALL_PREDICTION_KEY",
    baseUrl: "https://today-football-prediction.p.rapidapi.com",
  },
};

const routes: Record<string, { provider: string; path: (url: URL) => string }> = {
  predictions: { provider: "footballPredictions", path: (url) => `/predictions?${url.searchParams.toString()}` },
  markets: { provider: "footballPredictions", path: () => "/list-markets" },
  federations: { provider: "footballPredictions", path: () => "/list-federations" },
  betigoloSample: { provider: "betigoloSample", path: () => "/sample" },
  betigoloHistory: { provider: "betigoloHistory", path: () => "/premium/history" },
  sureBetsLeagues: { provider: "sureBets", path: () => "/leagues/" },
  sureBetsPredictions: { provider: "sureBets", path: (url) => `/predictions/list?page=${encodeURIComponent(url.searchParams.get("page") || "1")}` },
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "GET") return Response.json({ error: "Method not allowed" }, { status: 405, headers: corsHeaders });

  const requestUrl = new URL(request.url);
  const service = requestUrl.searchParams.get("service") || "";
  const route = routes[service];
  if (!route) return Response.json({ error: "Unsupported API service" }, { status: 400, headers: corsHeaders });

  const provider = providers[route.provider];
  const apiKey = Deno.env.get(provider.keyName);
  if (!apiKey) return Response.json({ error: `${provider.keyName} is not configured` }, { status: 503, headers: corsHeaders });

  try {
    const upstream = await fetch(`${provider.baseUrl}${route.path(requestUrl)}`, {
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": provider.host,
        "Content-Type": "application/json",
      },
    });
    const body = await upstream.text();
    return new Response(body, {
      status: upstream.status,
      headers: {
        ...corsHeaders,
        "Content-Type": upstream.headers.get("content-type") || "application/json",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (error) {
    console.error(`RapidAPI ${service} request failed:`, error);
    return Response.json({ error: "Upstream API request failed" }, { status: 502, headers: corsHeaders });
  }
});
