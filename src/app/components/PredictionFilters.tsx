import { useState } from 'react';
import { Filter, X } from 'lucide-react';

export interface PredictionFilterOptions {
  sport?: string;
  confidence?: 'all' | 'high' | 'medium' | 'low';
  timeRange?: 'today' | 'tomorrow' | 'week';
  sortBy?: 'confidence' | 'recent' | 'odds';
  savedOnly?: boolean;
}

interface PredictionFiltersProps {
  options: PredictionFilterOptions;
  onChange: (options: PredictionFilterOptions) => void;
  showAdvanced?: boolean;
}

const SPORTS = ['all', 'football', 'basketball', 'cricket', 'tennis'];
const CONFIDENCE_LEVELS = [
  { id: 'all', label: 'All Levels' },
  { id: 'high', label: 'High (70%+)', min: 70 },
  { id: 'medium', label: 'Medium (50-70%)', min: 50, max: 70 },
  { id: 'low', label: 'Low (<50%)', max: 50 },
];
const TIME_RANGES = [
  { id: 'today', label: '📅 Today' },
  { id: 'tomorrow', label: '📅 Tomorrow' },
  { id: 'week', label: '📅 This Week' },
];
const SORT_OPTIONS = [
  { id: 'confidence', label: '⭐ Confidence' },
  { id: 'recent', label: '⏱️ Latest Added' },
  { id: 'odds', label: '💰 Best Odds' },
];

export function PredictionFilters({
  options,
  onChange,
  showAdvanced = true,
}: PredictionFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateOption = <K extends keyof PredictionFilterOptions>(
    key: K,
    value: PredictionFilterOptions[K]
  ) => {
    onChange({ ...options, [key]: value });
  };

  const hasActiveFilters =
    options.sport !== 'all' ||
    options.confidence !== 'all' ||
    options.timeRange ||
    options.savedOnly;

  return (
    <div className="space-y-3">
      {/* Filter Toggle Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm font-medium text-white"
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 px-2 py-0.5 bg-[#00d4ff]/20 text-[#00d4ff] rounded-full text-xs font-semibold">
              Active
            </span>
          )}
        </button>
        {hasActiveFilters && (
          <button
            onClick={() =>
              onChange({
                sport: 'all',
                confidence: 'all',
                timeRange: undefined,
                sortBy: 'confidence',
                savedOnly: false,
              })
            }
            className="flex items-center gap-1 px-3 py-2 text-xs text-gray-400 hover:text-gray-200 transition-colors"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      {/* Expanded Filter Panel */}
      {isExpanded && showAdvanced && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
          {/* Sport Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Sport
            </label>
            <div className="flex flex-wrap gap-2">
              {SPORTS.map((sport) => (
                <button
                  key={sport}
                  onClick={() => updateOption('sport', sport)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    options.sport === sport
                      ? 'bg-[#00d4ff] text-black'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {sport.charAt(0).toUpperCase() + sport.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Confidence Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Confidence Level
            </label>
            <div className="flex flex-wrap gap-2">
              {CONFIDENCE_LEVELS.map((level) => (
                <button
                  key={level.id}
                  onClick={() =>
                    updateOption('confidence', level.id as PredictionFilterOptions['confidence'])
                  }
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    options.confidence === level.id
                      ? 'bg-[#00d4ff] text-black'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time Range Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Time Range
            </label>
            <div className="flex flex-wrap gap-2">
              {TIME_RANGES.map((range) => (
                <button
                  key={range.id}
                  onClick={() =>
                    updateOption(
                      'timeRange',
                      options.timeRange === range.id ? undefined : (range.id as any)
                    )
                  }
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    options.timeRange === range.id
                      ? 'bg-[#00d4ff] text-black'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Option */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Sort By
            </label>
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map((sort) => (
                <button
                  key={sort.id}
                  onClick={() =>
                    updateOption('sortBy', sort.id as PredictionFilterOptions['sortBy'])
                  }
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    options.sortBy === sort.id
                      ? 'bg-[#00d4ff] text-black'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {sort.label}
                </button>
              ))}
            </div>
          </div>

          {/* Saved Only Toggle */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => updateOption('savedOnly', !options.savedOnly)}
              className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
                options.savedOnly ? 'bg-[#00d4ff]' : 'bg-white/10'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  options.savedOnly ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
            <span className="text-sm text-gray-300">Saved Only</span>
          </div>
        </div>
      )}
    </div>
  );
}
