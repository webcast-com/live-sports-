import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Phase 3: Cache-Control middleware for edge caching
app.use("/make-server-ed1dd9fb/matches/*", async (c, next) => {
  await next();
  // Live data: cache 30s at CDN, 30s stale-while-revalidate
  c.header("Cache-Control", "public, max-age=30, s-maxage=30, stale-while-revalidate=60");
  c.header("CDN-Cache-Control", "public, max-age=60");
});

app.use("/make-server-ed1dd9fb/standings/*", async (c, next) => {
  await next();
  c.header("Cache-Control", "public, max-age=300, s-maxage=300, stale-while-revalidate=600");
});

app.use("/make-server-ed1dd9fb/highlights*", async (c, next) => {
  await next();
  c.header("Cache-Control", "public, max-age=600, s-maxage=600");
});

// Health check endpoint with cache bypass
app.get("/make-server-ed1dd9fb/health", (c) => {
  return c.json({ status: "ok", phase: "3", features: ["favorites", "realtime", "caching", "zod-validation", "secure-payments"] });
});

// Test endpoint to verify API key is set
app.get("/make-server-ed1dd9fb/test-api", (c) => {
  const apiKey = Deno.env.get("RAPIDAPI_FOOTBALL_HIGHLIGHTS_KEY");
  return c.json({ 
    apiKeySet: !!apiKey,
    apiKeyPrefix: apiKey ? apiKey.substring(0, 10) + "..." : "not set"
  });
});

// Fetch upcoming football matches from Football Highlights API
app.get("/make-server-ed1dd9fb/matches/upcoming", async (c) => {
  try {
    const apiKey = Deno.env.get("RAPIDAPI_FOOTBALL_HIGHLIGHTS_KEY");

    if (!apiKey) {
      console.log("⚠️ RAPIDAPI_KEY not configured - returning empty");
      return c.json([], 200);
    }

    console.log("📡 Fetching upcoming matches...");

    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const todayUrl = `https://football-highlights-api.p.rapidapi.com/matches?date=${dateStr}`;
    const tomorrowUrl = `https://football-highlights-api.p.rapidapi.com/matches?date=${tomorrowStr}`;

    // Fetch both in parallel
    const [todayResponse, tomorrowResponse] = await Promise.all([
      fetch(todayUrl, {
        method: "GET",
        headers: {
          "x-rapidapi-key": apiKey,
          "x-rapidapi-host": "football-highlights-api.p.rapidapi.com",
          "Content-Type": "application/json",
        },
      }).catch(() => ({ ok: false, status: 0 })),
      fetch(tomorrowUrl, {
        method: "GET",
        headers: {
          "x-rapidapi-key": apiKey,
          "x-rapidapi-host": "football-highlights-api.p.rapidapi.com",
          "Content-Type": "application/json",
        },
      }).catch(() => ({ ok: false, status: 0 })),
    ]);

    console.log(`📊 Today: ${todayResponse.status}, Tomorrow: ${tomorrowResponse.status}`);

    let allMatches: any[] = [];

    // Parse today's matches
    if (todayResponse.ok) {
      try {
        const todayText = await todayResponse.text();
        const todayData = JSON.parse(todayText);
        const todayMatches = Array.isArray(todayData) ? todayData : (todayData.data || []);
        allMatches = [...allMatches, ...todayMatches];
      } catch (e) {
        console.log('⚠️ Error parsing today:', e);
      }
    }

    // Parse tomorrow's matches
    if (tomorrowResponse.ok) {
      const tomorrowText = await tomorrowResponse.text();
      try {
        const tomorrowData = JSON.parse(tomorrowText);
        const tomorrowMatches = Array.isArray(tomorrowData) ? tomorrowData : (tomorrowData.data || []);
        allMatches = [...allMatches, ...tomorrowMatches];
      } catch (e) {
        console.log('⚠️ Error parsing tomorrow:', e);
      }
    }

    console.log(`✅ Got ${allMatches.length} upcoming matches`);
    return c.json(allMatches);
  } catch (error) {
    console.error(`❌ Exception: ${error}`);
    return c.json([], 200);
  }
});

// Fetch current live football matches from Football Highlights API
app.get("/make-server-ed1dd9fb/matches/live", async (c) => {
  try {
    const apiKey = Deno.env.get("RAPIDAPI_FOOTBALL_HIGHLIGHTS_KEY");

    if (!apiKey) {
      console.log("⚠️ RAPIDAPI_KEY not configured - returning demo data");
      return c.json([], 200);
    }

    console.log("📡 Fetching live matches from API...");

    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const url = `https://football-highlights-api.p.rapidapi.com/matches?date=${dateStr}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": "football-highlights-api.p.rapidapi.com",
        "Content-Type": "application/json",
      },
    });

    console.log(`📊 API Response: ${response.status}`);

    // Handle rate limit and quota errors gracefully
    if (response.status === 429) {
      console.warn("⚠️ API Rate Limit (429) - Daily quota exceeded. Upgrade at https://rapidapi.com/");
      return c.json([], 200); // Return empty, frontend uses demo data
    }

    if (response.status === 503) {
      console.warn("⚠️ API Service Unavailable (503)");
      return c.json([], 200);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error ${response.status}: ${errorText}`);
      return c.json([], 200); // Always return 200 with empty data for graceful fallback
    }

    const responseText = await response.text();
    let data = [];

    try {
      const parsed = JSON.parse(responseText);
      data = Array.isArray(parsed) ? parsed : (parsed.data || []);
      console.log(`✅ Got ${data.length} matches from API`);
    } catch (e) {
      console.error(`❌ Parse error: ${e}`);
    }

    return c.json(data);
  } catch (error) {
    console.error(`❌ Exception: ${error}`);
    return c.json([], 200); // Graceful fallback
  }
});

// Fetch detailed match information
app.get("/make-server-ed1dd9fb/match/:matchId", async (c) => {
  try {
    const apiKey = Deno.env.get("RAPIDAPI_FOOTBALL_HIGHLIGHTS_KEY");

    if (!apiKey) {
      console.log("Error fetching match details: RAPIDAPI_KEY environment variable not set");
      return c.json({ error: "API key not configured" }, 500);
    }

    const matchId = c.req.param("matchId");
    console.log(`Fetching details for match ID: ${matchId}`);

    const url = `https://football-highlights-api.p.rapidapi.com/football/matches/${matchId}`;
    console.log(`Match details API URL: ${url}`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": "football-highlights-api.p.rapidapi.com",
      },
    });

    console.log(`Match details API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`Error fetching match details from API: ${response.status} - ${errorText}`);

      return c.json({
        error: `Match details API request failed with status ${response.status}`,
        details: errorText,
        matchId: matchId,
        message: "Match details may not be available for this match."
      }, 200);
    }

    const contentType = response.headers.get("content-type");
    const responseText = await response.text();
    console.log(`Match details response (first 500 chars):`, responseText.substring(0, 500));

    let data;
    try {
      if (contentType?.includes("application/json") || responseText.trim().startsWith("{") || responseText.trim().startsWith("[")) {
        data = JSON.parse(responseText);
        console.log(`Successfully parsed match details JSON`);
      } else {
        console.log(`Non-JSON response received. Content type: ${contentType}`);
        return c.json({
          error: "Invalid API response format",
          message: "The match details API returned an unexpected response format.",
          matchId: matchId
        }, 200);
      }
    } catch (parseError) {
      console.log(`Failed to parse match details response: ${parseError}`);
      return c.json({
        error: "Failed to parse match details response",
        details: String(parseError),
        message: "Unable to process the match details data.",
        matchId: matchId
      }, 200);
    }

    // The API returns an array with a single match object
    const matchData = Array.isArray(data) ? data[0] : data;

    return c.json({
      success: true,
      match: matchData,
      matchId: matchId
    });
  } catch (error) {
    console.log(`Exception while fetching match details: ${error}`);
    return c.json({
      error: "Failed to fetch match details",
      details: String(error),
      message: "An error occurred while trying to fetch match details."
    }, 200);
  }
});

// Fetch live stream link for a specific football match
app.get("/make-server-ed1dd9fb/stream/:matchSlug", async (c) => {
  try {
    const apiKey = Deno.env.get("RAPIDAPI_FOOTBALL_LIVE_STREAM_KEY");
    
    if (!apiKey) {
      console.log("Error fetching stream link: RAPIDAPI_KEY environment variable not set");
      return c.json({ error: "API key not configured" }, 500);
    }

    const matchSlug = c.req.param("matchSlug");
    console.log(`Fetching stream link for match: ${matchSlug}`);
    
    const url = `https://football-live-stream-api.p.rapidapi.com/link/${matchSlug}`;
    console.log(`Stream API URL: ${url}`);
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": "football-live-stream-api.p.rapidapi.com",
        "Content-Type": "application/json",
      },
    });

    console.log(`Football Live Stream API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`Error fetching stream link from API: ${response.status} - ${errorText}`);

      // Return a more detailed error response
      return c.json({
        error: `Stream API request failed with status ${response.status}`,
        details: errorText,
        matchSlug: matchSlug,
        message: "Stream may not be available for this match. The Football Live Stream API might not have coverage for this specific game."
      }, 200); // Return 200 so frontend can handle gracefully
    }

    // Read response as text first, then check format
    const responseText = await response.text();
    const contentType = response.headers.get("content-type");
    console.log(`Stream response content-type: ${contentType}`);
    console.log(`Stream response (first 300 chars):`, responseText.substring(0, 300));

    return c.json({
      success: true,
      streamData: responseText,
      matchSlug: matchSlug
    });
  } catch (error) {
    console.log(`Exception while fetching stream link: ${error}`);
    return c.json({ 
      error: "Failed to fetch stream link", 
      details: String(error),
      message: "An error occurred while trying to fetch the stream. Please try again later."
    }, 200); // Return 200 so frontend can handle gracefully
  }
});

// Fetch all available live football streams
app.get("/make-server-ed1dd9fb/streams/live", async (c) => {
  try {
    const apiKey = Deno.env.get("RAPIDAPI_ALLSPORTS_KEY");
    
    if (!apiKey) {
      console.log("Error fetching live streams: RAPIDAPI_KEY environment variable not set");
      return c.json({ error: "API key not configured" }, 500);
    }

    console.log("Fetching live football streams...");
    
    // First get live matches from AllSportsAPI
    const matchesResponse = await fetch("https://allsportsapi2.p.rapidapi.com/api/matches/live", {
      method: "GET",
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": "allsportsapi2.p.rapidapi.com",
        "Content-Type": "application/json",
      },
    });

    if (!matchesResponse.ok) {
      console.log(`Error fetching matches for streams: ${matchesResponse.status}`);
      return c.json({ error: "Failed to fetch live matches" }, matchesResponse.status);
    }

    const matchesData = await matchesResponse.json();
    console.log(`Found live matches data:`, JSON.stringify(matchesData).substring(0, 200));
    
    return c.json({ 
      matches: matchesData,
      note: "Use /stream/:matchSlug endpoint to get specific stream links"
    });
  } catch (error) {
    console.log(`Exception while fetching live streams: ${error}`);
    return c.json({ error: "Failed to fetch live streams", details: String(error) }, 500);
  }
});

// Fetch highlights for a specific match
app.get("/make-server-ed1dd9fb/highlights/:matchId", async (c) => {
  try {
    const apiKey = Deno.env.get("RAPIDAPI_LIVE_FOOTBALL_STREAMING_KEY");
    
    if (!apiKey) {
      console.log("Error fetching highlights: RAPIDAPI_KEY environment variable not set");
      return c.json({ error: "API key not configured" }, 500);
    }

    const matchId = c.req.param("matchId");
    console.log(`Fetching highlights for match ID: ${matchId}`);
    
    const url = `https://live-football-streaming-api.p.rapidapi.com/api/v1/match/streamlinks/${matchId}`;
    console.log(`Highlights API URL: ${url}`);
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": "live-football-streaming-api.p.rapidapi.com",
        "Content-Type": "application/json",
      },
    });

    console.log(`Live Football Streaming API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`Error fetching highlights from API: ${response.status} - ${errorText}`);

      return c.json({
        error: `Highlights API request failed with status ${response.status}`,
        details: errorText,
        matchId: matchId,
        message: "Highlights may not be available for this match yet."
      }, 200);
    }

    // Try to parse as JSON, but handle non-JSON responses
    const contentType = response.headers.get("content-type");
    console.log(`Response content-type: ${contentType}`);

    let data;
    try {
      const responseText = await response.text();
      console.log(`Raw response (first 300 chars): ${responseText.substring(0, 300)}`);

      // Check if response looks like JSON
      if (contentType?.includes("application/json") || responseText.trim().startsWith("{") || responseText.trim().startsWith("[")) {
        data = JSON.parse(responseText);
        console.log(`Successfully parsed highlights JSON:`, JSON.stringify(data).substring(0, 200));
      } else {
        // Non-JSON response (HTML, plain text, etc.)
        console.log(`Non-JSON response received. Content type: ${contentType}`);
        return c.json({
          error: "Invalid API response format",
          message: "The highlights API returned an unexpected response format. Highlights may not be available for this match.",
          matchId: matchId
        }, 200);
      }
    } catch (parseError) {
      console.log(`Failed to parse highlights response: ${parseError}`);
      return c.json({
        error: "Failed to parse highlights response",
        details: String(parseError),
        message: "Unable to process the highlights data. Please try again later.",
        matchId: matchId
      }, 200);
    }

    return c.json({
      success: true,
      highlights: data,
      matchId: matchId
    });
  } catch (error) {
    console.log(`Exception while fetching highlights: ${error}`);
    return c.json({ 
      error: "Failed to fetch highlights", 
      details: String(error),
      message: "An error occurred while trying to fetch highlights. Please try again later."
    }, 200);
  }
});

// Fetch all available highlights from Free API Live Football Data
app.get("/make-server-ed1dd9fb/highlights", async (c) => {
  try {
    const apiKey = Deno.env.get("RAPIDAPI_FREE_FOOTBALL_HIGHLIGHTS_KEY");

    if (!apiKey) {
      console.log("Error fetching highlights list: RAPIDAPI_KEY environment variable not set");
      return c.json({ error: "API key not configured" }, 500);
    }

    console.log("Fetching football event highlights from Free API Live Football Data...");

    const response = await fetch("https://free-football-api-data.p.rapidapi.com/football-event-highlights", {
      method: "GET",
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": "free-football-api-data.p.rapidapi.com",
        "Content-Type": "application/json",
      },
    });

    console.log(`Free Football API highlights response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`Error fetching highlights from API: ${response.status} - ${errorText}`);
      return c.json({
        error: `Highlights API request failed with status ${response.status}`,
        details: errorText,
        message: "Highlights may not be available at this time."
      }, 200);
    }

    const contentType = response.headers.get("content-type");
    console.log(`Highlights response content-type: ${contentType}`);

    let data;
    try {
      const responseText = await response.text();
      console.log(`Highlights raw response (first 300 chars): ${responseText.substring(0, 300)}`);

      if (contentType?.includes("application/json") || responseText.trim().startsWith("{") || responseText.trim().startsWith("[")) {
        data = JSON.parse(responseText);
        console.log(`Successfully parsed highlights JSON:`, JSON.stringify(data).substring(0, 200));
      } else {
        console.log(`Non-JSON response received. Content type: ${contentType}`);
        return c.json({
          error: "Invalid API response format",
          message: "The highlights API returned an unexpected response format.",
        }, 200);
      }
    } catch (parseError) {
      console.log(`Failed to parse highlights response: ${parseError}`);
      return c.json({
        error: "Failed to parse highlights response",
        details: String(parseError),
        message: "Unable to process the highlights data. Please try again later."
      }, 200);
    }

    return c.json({
      success: true,
      highlights: data,
    });
  } catch (error) {
    console.log(`Exception while fetching highlights list: ${error}`);
    return c.json({ error: "Failed to fetch highlights list", details: String(error) }, 500);
  }
});

// Fetch league standings
app.get("/make-server-ed1dd9fb/standings/:leagueId", async (c) => {
  try {
    const apiKey = Deno.env.get("RAPIDAPI_FREE_FOOTBALL_STANDINGS_KEY");

    if (!apiKey) {
      console.log("Error fetching standings: RAPIDAPI_KEY environment variable not set");
      return c.json({ error: "API key not configured" }, 500);
    }

    const leagueId = c.req.param("leagueId");
    console.log(`Fetching standings for league ID: ${leagueId}`);

    const url = `https://free-api-live-football-data.p.rapidapi.com/football-get-standing-all?leagueid=${leagueId}`;
    console.log(`Standings API URL: ${url}`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": "free-api-live-football-data.p.rapidapi.com",
        "Content-Type": "application/json",
      },
    });

    console.log(`Free API Live Football Data response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`Error fetching standings from API: ${response.status} - ${errorText}`);

      return c.json({
        error: `Standings API request failed with status ${response.status}`,
        details: errorText,
        leagueId: leagueId,
        message: "Standings may not be available for this league."
      }, 200);
    }

    // Try to parse as JSON, but handle non-JSON responses
    const contentType = response.headers.get("content-type");
    console.log(`Standings response content-type: ${contentType}`);

    let data;
    try {
      const responseText = await response.text();
      console.log(`Standings raw response (first 300 chars): ${responseText.substring(0, 300)}`);

      // Check if response looks like JSON
      if (contentType?.includes("application/json") || responseText.trim().startsWith("{") || responseText.trim().startsWith("[")) {
        data = JSON.parse(responseText);
        console.log(`Successfully parsed standings JSON:`, JSON.stringify(data).substring(0, 200));
      } else {
        // Non-JSON response (HTML, plain text, etc.)
        console.log(`Non-JSON response received. Content type: ${contentType}`);
        return c.json({
          error: "Invalid API response format",
          message: "The standings API returned an unexpected response format. Standings may not be available for this league.",
          leagueId: leagueId
        }, 200);
      }
    } catch (parseError) {
      console.log(`Failed to parse standings response: ${parseError}`);
      return c.json({
        error: "Failed to parse standings response",
        details: String(parseError),
        message: "Unable to process the standings data. Please try again later.",
        leagueId: leagueId
      }, 200);
    }

    return c.json({
      success: true,
      standings: data,
      leagueId: leagueId
    });
  } catch (error) {
    console.log(`Exception while fetching standings: ${error}`);
    return c.json({
      error: "Failed to fetch standings",
      details: String(error),
      message: "An error occurred while trying to fetch standings. Please try again later."
    }, 200);
  }
});

// Fetch football event detail by event ID
app.get("/make-server-ed1dd9fb/event/:eventId", async (c) => {
  try {
    const apiKey = Deno.env.get("RAPIDAPI_FREE_FOOTBALL_EVENT_KEY");

    if (!apiKey) {
      console.log("Error fetching event detail: RAPIDAPI_KEY environment variable not set");
      return c.json({ error: "API key not configured" }, 500);
    }

    const eventId = c.req.param("eventId");
    console.log(`Fetching event detail for event ID: ${eventId}`);

    const url = `https://free-football-api-data.p.rapidapi.com/football-event-detail?eventid=${eventId}`;
    console.log(`Event detail API URL: ${url}`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": "free-football-api-data.p.rapidapi.com",
        "Content-Type": "application/json",
      },
    });

    console.log(`Free Football API event detail response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`Error fetching event detail from API: ${response.status} - ${errorText}`);

      return c.json({
        error: `Event detail API request failed with status ${response.status}`,
        details: errorText,
        eventId: eventId,
        message: "Event details may not be available."
      }, 200);
    }

    const contentType = response.headers.get("content-type");
    console.log(`Event detail response content-type: ${contentType}`);

    let data;
    try {
      const responseText = await response.text();
      console.log(`Event detail raw response (first 300 chars): ${responseText.substring(0, 300)}`);

      if (contentType?.includes("application/json") || responseText.trim().startsWith("{") || responseText.trim().startsWith("[")) {
        data = JSON.parse(responseText);
        console.log(`Successfully parsed event detail JSON:`, JSON.stringify(data).substring(0, 200));
      } else {
        console.log(`Non-JSON response received. Content type: ${contentType}`);
        return c.json({
          error: "Invalid API response format",
          message: "The event detail API returned an unexpected response format.",
          eventId: eventId
        }, 200);
      }
    } catch (parseError) {
      console.log(`Failed to parse event detail response: ${parseError}`);
      return c.json({
        error: "Failed to parse event detail response",
        details: String(parseError),
        message: "Unable to process the event detail data. Please try again later.",
        eventId: eventId
      }, 200);
    }

    return c.json({
      success: true,
      event: data,
      eventId: eventId
    });
  } catch (error) {
    console.log(`Exception while fetching event detail: ${error}`);
    return c.json({
      error: "Failed to fetch event detail",
      details: String(error),
      message: "An error occurred while trying to fetch event details. Please try again later."
    }, 200);
  }
});

Deno.serve(app.fetch);
