import { useEffect, useState, useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight, Trophy, TrendingUp, Search, X, RefreshCw, Crown, Lock, Sparkles, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { motion } from "motion/react";
import { fetchSupabaseApi } from '@/app/services/supabaseApi';

const CACHE_DURATION = {
  LEAGUES: 24,
  PREDICTIONS: 8,
};

const cacheManager = {
  get<T>(key: string): T | null {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const parsed = JSON.parse(cached) as { data: T; timestamp: number; duration: number };
    if (Date.now() - parsed.timestamp > parsed.duration * 60 * 60 * 1000) {
      localStorage.removeItem(key);
      return null;
    }

    return parsed.data;
  },
  getLastUpdated(key: string): Date | null {
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    return new Date((JSON.parse(cached) as { timestamp: number }).timestamp);
  },
  set<T>(key: string, data: T, duration: number) {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now(), duration }));
  },
};

const updateMetaTags = ({ title, description, keywords, url }: { title?: string; description?: string; keywords?: string; url?: string }) => {
  if (title) document.title = title;
  const metadata = { description, keywords, url };
  Object.entries(metadata).forEach(([name, content]) => {
    if (!content) return;
    const attribute = name === "url" ? "property" : "name";
    const key = name === "url" ? "og:url" : name;
    let meta = document.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute(attribute, key);
      document.head.appendChild(meta);
    }
    meta.content = content;
  });
};

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
    },
  },
};

const headerVariants = {
  hidden: { opacity: 0, y: -30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

interface Match {
  id: string;
  home_team: string;
  away_team: string;
  date: string;
  date_time: string;
  league: string;
  prediction: string;
  prediction_odd: number | null;
  prediction_probability: number;
  is_finished: boolean;
  result_score?: string;
  is_prediction_correct?: boolean;
}

interface Pagination {
  no_of_docs_total: number;
  no_of_docs_in_page: number;
  page: number;
}

interface ApiResponse {
  pagination: Pagination;
  matches: Match[];
}

interface League {
  id: string;
  name: string;
}

interface LeaguesResponse {
  league: League[];
}

const getPredictionLabel = (prediction: string) => {
  const labels: { [key: string]: string } = {
    "1": "Home Win",
    X: "Draw",
    "2": "Away Win",
  };
  return labels[prediction] || prediction;
};

const getPredictionColor = (prediction: string) => {
  if (prediction === "1") return "from-blue-600 to-blue-700";
  if (prediction === "X") return "from-purple-600 to-purple-700";
  if (prediction === "2") return "from-orange-600 to-orange-700";
  return "from-gray-600 to-gray-700";
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

export function SureBets({ onUpgrade }: { onUpgrade: () => void }) {
  const { user } = useAuth();
  const isPremium = user?.plan === "premium";
  const [data, setData] = useState<ApiResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [leagues, setLeagues] = useState<{ [key: string]: string }>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPrediction, setFilterPrediction] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [cacheInfo, setCacheInfo] = useState<string>("");
  const providerUnavailableRef = useRef(false);
  const leaguesRequestInFlightRef = useRef(false);
  const predictionsRequestInFlightRef = useRef(false);

  const fetchLeagues = async () => {
    const cacheKey = "leagues";

    if (providerUnavailableRef.current || leaguesRequestInFlightRef.current) {
      return;
    }

    const cachedLeagues = cacheManager.get<{ [key: string]: string }>(cacheKey);
    if (cachedLeagues) {
      setLeagues(cachedLeagues);
      const lastUpdated = cacheManager.getLastUpdated(cacheKey);
      if (lastUpdated) {
        setCacheInfo(`Leagues cached from ${lastUpdated.toLocaleTimeString()}`);
      }
      return;
    }

    try {
      leaguesRequestInFlightRef.current = true;
      const result = await fetchSupabaseApi<LeaguesResponse>('sureBetsLeagues');
      const leagueMap: { [key: string]: string } = {};

      if (result && result.league && Array.isArray(result.league)) {
        result.league.forEach((league) => {
          leagueMap[league.id] = league.name;
        });
        setLeagues(leagueMap);
        cacheManager.set(cacheKey, leagueMap, CACHE_DURATION.LEAGUES);
        setCacheInfo("Leagues loaded (cached for 24 hours)");
      }
    } catch (error) {
      providerUnavailableRef.current = true;
      setError("Live predictions are temporarily unavailable. Showing cached data when available.");
    } finally {
      leaguesRequestInFlightRef.current = false;
    }
  };

  const fetchPredictions = async (page: number, forceRefresh: boolean = false) => {
    const cacheKey = `predictions_page_${page}`;

    if (predictionsRequestInFlightRef.current) {
      return;
    }

    if (providerUnavailableRef.current) {
      setLoading(false);
      setError("Live predictions are temporarily unavailable. Showing cached data when available.");
      return;
    }

    if (!forceRefresh) {
      const cachedData = cacheManager.get<ApiResponse>(cacheKey);
      if (cachedData) {
        setData(cachedData);
        const lastUpdated = cacheManager.getLastUpdated(cacheKey);
        if (lastUpdated) {
          setLastUpdated(lastUpdated);
          setCacheInfo(`Data cached from ${lastUpdated.toLocaleTimeString()}`);
        }
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    setError(null);
    try {
      predictionsRequestInFlightRef.current = true;
      const result = await fetchSupabaseApi<ApiResponse>('sureBetsPredictions', { page: String(page) });
      setData(result);
      setLastUpdated(new Date());

      cacheManager.set(cacheKey, result, CACHE_DURATION.PREDICTIONS);
      setCacheInfo(`Data cached for ${CACHE_DURATION.PREDICTIONS} hours`);
    } catch (error) {
      providerUnavailableRef.current = true;
      setError("Live predictions are temporarily unavailable. Showing cached data when available.");
    } finally {
      predictionsRequestInFlightRef.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeagues();
    updateMetaTags({
      title: "Football Predictions | Live Match Predictions & Analytics",
      description: "Real-time football match predictions with odds, probability analysis, and prediction accuracy tracking across all major leagues.",
      keywords: "football predictions, soccer predictions, match predictions, football odds, prediction probability",
      url: window.location.href,
    });
  }, []);

  useEffect(() => {
    fetchPredictions(currentPage);
  }, [currentPage]);

  useEffect(() => {
    if (data?.pagination) {
      const matchCount = data.pagination.no_of_docs_total;
      updateMetaTags({
        description: `Explore ${matchCount} football match predictions with real-time odds and probability analysis. Get expert predictions for upcoming matches.`,
      });
    }
  }, [data?.pagination?.no_of_docs_total]);

  const totalPages = data && data.pagination
    ? Math.ceil(data.pagination.no_of_docs_total / data.pagination.no_of_docs_in_page)
    : 0;

  const filteredMatches = useMemo(() => {
    if (!data || !Array.isArray(data.matches)) return [];

    return data.matches.filter((match) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        match.home_team.toLowerCase().includes(searchLower) ||
        match.away_team.toLowerCase().includes(searchLower) ||
        (leagues[match.league]?.toLowerCase().includes(searchLower) ?? false);

      const matchesPrediction = !filterPrediction || match.prediction === filterPrediction;

      const matchesStatus =
        !filterStatus ||
        (filterStatus === "finished" && match.is_finished) ||
        (filterStatus === "live" && !match.is_finished);

      return matchesSearch && matchesPrediction && matchesStatus;
    });
  }, [data, searchTerm, filterPrediction, filterStatus, leagues]);

  const displayMatches = Array.isArray(filteredMatches) ? filteredMatches : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <header className="border-b border-slate-800 sticky top-0 z-50 bg-slate-950/80 backdrop-blur-sm">
        <motion.div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
          initial="hidden"
          animate="show"
          variants={headerVariants}
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                className="p-2.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <Trophy className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <h1 className="text-3xl font-bold text-white">Sure Bets</h1>
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300"><Crown className="h-3 w-3" /> Premium</span>
                </div>
                <p className="text-sm text-slate-400">High-confidence match analysis, refreshed throughout the day.</p>
              </div>
            </div>
            {!isPremium && (
              <button onClick={onUpgrade} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-transform hover:scale-[1.02] active:scale-[0.98]">
                <Crown className="h-4 w-4" /> Unlock today’s picks
              </button>
            )}
          </div>
        </motion.div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!isPremium && (
          <section className="relative mb-8 overflow-hidden rounded-2xl border border-cyan-400/20 bg-gradient-to-r from-cyan-500/10 via-slate-900 to-amber-500/10 p-5 shadow-lg shadow-cyan-500/5 sm:p-6">
            <div className="absolute -right-10 -top-12 h-36 w-36 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-lg shadow-cyan-500/20"><Sparkles className="h-5 w-5" /></div>
                <div>
                  <p className="text-base font-bold text-white">Today’s upcoming picks are Premium</p>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">Review completed results for free. Upgrade to reveal upcoming match selections, odds, and confidence before kick-off.</p>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-300">
                    <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Completed results stay visible</span>
                    <span className="inline-flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-amber-400" /> Upcoming picks are protected</span>
                  </div>
                </div>
              </div>
              <button onClick={onUpgrade} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-amber-300/30 bg-amber-400/10 px-4 py-2.5 text-sm font-bold text-amber-200 transition-colors hover:bg-amber-400/20"><Crown className="h-4 w-4" /> Go Premium</button>
            </div>
          </section>
        )}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by team name or league..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Prediction Type
              </label>
              <select
                value={filterPrediction}
                onChange={(e) => setFilterPrediction(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
              >
                <option value="">All Predictions</option>
                <option value="1">Home Win</option>
                <option value="X">Draw</option>
                <option value="2">Away Win</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Match Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
              >
                <option value="">All Matches</option>
                <option value="live">Live/Upcoming</option>
                <option value="finished">Finished</option>
              </select>
            </div>
          </div>

          {(searchTerm || filterPrediction || filterStatus) && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-slate-400">Active filters:</span>
              {searchTerm && (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-slate-700 rounded-full text-sm text-white">
                  Search: "{searchTerm}"
                  <button onClick={() => setSearchTerm("")} className="hover:text-cyan-400">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filterPrediction && (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-slate-700 rounded-full text-sm text-white">
                  Prediction: {getPredictionLabel(filterPrediction)}
                  <button onClick={() => setFilterPrediction("")} className="hover:text-cyan-400">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filterStatus && (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-slate-700 rounded-full text-sm text-white">
                  Status: {filterStatus === "finished" ? "Finished" : "Live"}
                  <button onClick={() => setFilterStatus("")} className="hover:text-cyan-400">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={itemVariants} className="bg-slate-800/50 border border-white rounded-lg p-4 [text-shadow:1px_1px_3px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2 text-white text-sm mb-1 [text-shadow:1px_1px_3px_rgba(0,0,0,1)]">
              <TrendingUp className="h-4 w-4" />
              Total Predictions
            </div>
            <p className="text-3xl font-bold text-white">{data?.pagination?.no_of_docs_total || 0}</p>
          </motion.div>
          <motion.div variants={itemVariants} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="text-white text-sm mb-1 [text-shadow:1px_1px_3px_rgba(0,0,0,1)]">Page</div>
            <p className="text-3xl font-bold text-white">{currentPage} / {totalPages}</p>
          </motion.div>
          <motion.div variants={itemVariants} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="text-white text-sm mb-1 [text-shadow:1px_1px_3px_rgba(0,0,0,1)]">Matches Per Page</div>
            <p className="text-3xl font-bold text-white">{data?.pagination?.no_of_docs_in_page || 0}</p>
          </motion.div>
        </motion.div>

        <motion.div
          className="mb-8 p-4 bg-slate-800/30 border border-slate-700/50 rounded-lg flex items-center justify-between"
          variants={itemVariants}
          initial="hidden"
          animate="show"
        >
          <div>
            <p className="text-sm text-slate-400">{cacheInfo || "Data loading..."}</p>
            <p className="text-xs text-slate-500 mt-1">API Quota: ~3 calls/day (100/month limit) • Smart caching enabled</p>
          </div>
          <motion.button
            onClick={() => fetchPredictions(currentPage, true)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-600 text-white rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span className="text-sm">Refresh</span>
          </motion.button>
        </motion.div>

        {error ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center max-w-md">
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 font-semibold mb-2">Error Loading Predictions</p>
                <p className="text-red-300 text-sm mb-4">{error}</p>
                {error.includes("exceeded") || error.includes("quota") ? (
                  <div className="text-sm text-slate-400 space-y-2">
                    <p>Your API quota has been exceeded. Please:</p>
                    <ul className="list-disc list-inside text-left text-slate-400">
                      <li>Upgrade your RapidAPI plan</li>
                      <li>Or contact support for assistance</li>
                    </ul>
                  </div>
                ) : null}
              </div>
              <button
                onClick={() => {
                  setError(null);
                  fetchPredictions(currentPage);
                }}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="inline-block">
                <svg className="animate-spin h-12 w-12 text-cyan-500" viewBox="0 0 50 50">
                  <circle className="opacity-30" cx="25" cy="25" r="20" stroke="currentColor" strokeWidth="5" fill="none" />
                  <circle className="text-cyan-500" cx="25" cy="25" r="20" stroke="currentColor" strokeWidth="5" fill="none" strokeDasharray="100" strokeDashoffset="75" />
                </svg>
              </div>
              <p className="mt-4 text-slate-400">Loading predictions...</p>
            </div>
          </div>
        ) : displayMatches.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <p className="text-slate-400 text-lg">No matches found</p>
              <p className="text-slate-500 text-sm mt-2">Try adjusting your search or filters</p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 text-slate-400 text-sm">
              Showing {displayMatches.length} of {data?.pagination?.no_of_docs_in_page || 0} matches on this page
            </div>

            <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="show">
              {Array.isArray(displayMatches) && displayMatches.map((match) => {
                const isLocked = !isPremium && !match.is_finished;
                return (
                <motion.div
                  key={match.id}
                  variants={itemVariants}
                  className={`bg-slate-800/30 border rounded-xl overflow-hidden transition-colors group ${isLocked ? "border-amber-400/20" : "border-slate-700/50 hover:border-slate-600"}`}
                  whileHover={{ y: -2 }}
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-400 uppercase">{formatDate(match.date_time)}</span>
                        <span className="text-xs text-slate-500">•</span>
                        <span className="text-xs font-semibold text-cyan-400">{leagues[match.league] || `League ${match.league}`}</span>
                      </div>
                      {match.is_finished && (
                        <span className="text-xs font-bold text-slate-400 bg-slate-700/50 px-2 py-1 rounded">FINISHED</span>
                      )}
                    </div>

                    <div className="grid grid-cols-12 gap-4 items-center mb-4">
                      <div className="col-span-5 sm:col-span-4">
                        <p className="text-sm font-semibold text-white truncate">{match.home_team}</p>
                        <p className="text-xs text-slate-400 mt-1">Home</p>
                      </div>

                      <div className="col-span-2 sm:col-span-4">
                        <div className="text-center">
                          {match.is_finished ? (
                            <div>
                              <p className="text-base sm:text-lg font-bold text-white">{match.result_score}</p>
                              <p className="text-xs text-slate-400 mt-1">
                                {match.is_prediction_correct ? (
                                  <span className="text-success-DEFAULT font-semibold">✓ Correct</span>
                                ) : (
                                  <span className="text-red-400 font-semibold">✗ Wrong</span>
                                )}
                              </p>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-500 uppercase font-semibold">{formatTime(match.date_time)}</p>
                          )}
                        </div>
                      </div>

                      <div className="col-span-5 sm:col-span-4 text-right">
                        <p className="text-sm font-semibold text-white truncate">{match.away_team}</p>
                        <p className="text-xs text-slate-400 mt-1">Away</p>
                      </div>
                    </div>

                    {isLocked ? (
                      <div className="rounded-lg border border-amber-300/20 bg-gradient-to-r from-amber-400/10 to-orange-500/10 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-400/15 text-amber-300"><Lock className="h-4 w-4" /></div>
                            <div>
                              <p className="text-sm font-bold text-white">Upcoming pick locked</p>
                              <p className="mt-0.5 text-xs text-slate-400">Selection, odds, and confidence unlock before kick-off.</p>
                            </div>
                          </div>
                          <button onClick={onUpgrade} className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 px-3.5 py-2 text-xs font-bold text-white transition-transform hover:scale-[1.02]"><Crown className="h-3.5 w-3.5" /> Reveal pick</button>
                        </div>
                      </div>
                    ) : (
                      <div className={`bg-gradient-to-r ${getPredictionColor(match.prediction)} rounded-lg p-4 flex items-center justify-between`}>
                        <div>
                          <p className="text-xs font-semibold text-white/80 uppercase">Prediction</p>
                          <p className="text-lg font-bold text-white">{getPredictionLabel(match.prediction)}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-white/90 text-center mb-1">
                            {match.prediction_odd ? (
                              <>
                                <p className="text-xs font-semibold text-white/80 uppercase">Odds</p>
                                <p className="text-2xl font-bold text-white">{match.prediction_odd.toFixed(2)}</p>
                              </>
                            ) : (
                              <p className="text-xs font-semibold text-white/80 uppercase">N/A</p>
                            )}
                          </div>
                          <p className="text-xs text-white/70">{match.prediction_probability}% probability</p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
                );
              })}
            </motion.div>

            <motion.div className="flex items-center justify-center gap-4 mt-12" variants={itemVariants} initial="hidden" animate="show">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              <div className="flex items-center gap-2">
                {(() => {
                  const pageNumbers = [];
                  let startPage = Math.max(1, currentPage - 2);
                  const endPage = Math.min(totalPages, startPage + 4);

                  if (endPage - startPage < 4) {
                    startPage = Math.max(1, endPage - 4);
                  }

                  for (let i = startPage; i <= endPage; i++) {
                    pageNumbers.push(i);
                  }

                  return pageNumbers.map((pageNum) => (
                    <button
                      key={`page-${pageNum}`}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-lg font-semibold transition-colors ${
                        pageNum === currentPage
                          ? "bg-cyan-500 text-white"
                          : "bg-slate-800 border border-slate-700 text-white hover:bg-slate-700"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ));
                })()}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </motion.div>
          </>
        )}
      </main>
    </div>
  );
}

export default SureBets;
