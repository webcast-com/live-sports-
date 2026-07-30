import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Target, Award, Calendar } from 'lucide-react';

interface AccuracyDataPoint {
  date: string;
  accuracy: number;
  predictions: number;
  correct: number;
  avgConfidence?: number;
}

interface PredictionAccuracyChartProps {
  data?: AccuracyDataPoint[];
  type?: 'line' | 'area' | 'bar';
  showConfidence?: boolean;
}

// Mock data for demo
const mockAccuracyData: AccuracyDataPoint[] = [
  { date: 'Mon', accuracy: 65, predictions: 10, correct: 6, avgConfidence: 72 },
  { date: 'Tue', accuracy: 72, predictions: 12, correct: 8, avgConfidence: 75 },
  { date: 'Wed', accuracy: 68, predictions: 8, correct: 5, avgConfidence: 70 },
  { date: 'Thu', accuracy: 75, predictions: 15, correct: 11, avgConfidence: 78 },
  { date: 'Fri', accuracy: 80, predictions: 10, correct: 8, avgConfidence: 82 },
  { date: 'Sat', accuracy: 78, predictions: 20, correct: 15, avgConfidence: 80 },
  { date: 'Sun', accuracy: 82, predictions: 18, correct: 14, avgConfidence: 85 },
];

const weeklyAccuracy = [
  { week: 'W1', accuracy: 62, predictions: 45 },
  { week: 'W2', accuracy: 68, predictions: 52 },
  { week: 'W3', accuracy: 71, predictions: 48 },
  { week: 'W4', accuracy: 77, predictions: 60 },
];

const predictionTypes = [
  { type: 'Home Win', accuracy: 72, count: 45, color: '#00d4ff' },
  { type: 'Draw', accuracy: 45, count: 20, color: '#ffb800' },
  { type: 'Away Win', accuracy: 68, count: 38, color: '#00ff88' },
  { type: 'Over 2.5', accuracy: 75, count: 52, color: '#ff4757' },
  { type: 'BTTS', accuracy: 70, count: 40, color: '#7c3aed' },
];

export const PredictionAccuracyChart: React.FC<PredictionAccuracyChartProps> = ({
  data = mockAccuracyData,
  type = 'area',
  showConfidence = true,
}) => {
  const avgAccuracy = data.reduce((sum, d) => sum + d.accuracy, 0) / data.length;
  const totalPredictions = data.reduce((sum, d) => sum + d.predictions, 0);
  const totalCorrect = data.reduce((sum, d) => sum + d.correct, 0);
  const overallAccuracy = Math.round((totalCorrect / totalPredictions) * 100);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#161b22] border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-[#00d4ff]" />
            <span className="text-xs text-gray-500 uppercase">Overall Accuracy</span>
          </div>
          <p className="text-2xl font-black text-white">{overallAccuracy}%</p>
          <p className="text-xs text-gray-500 mt-1">{totalCorrect}/{totalPredictions} correct</p>
        </div>
        <div className="bg-[#161b22] border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-gray-500 uppercase">Avg Accuracy</span>
          </div>
          <p className="text-2xl font-black text-white">{avgAccuracy.toFixed(1)}%</p>
          <p className="text-xs text-emerald-400 mt-1">+5.2% this week</p>
        </div>
        <div className="bg-[#161b22] border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-gray-500 uppercase">Total Picks</span>
          </div>
          <p className="text-2xl font-black text-white">{totalPredictions}</p>
          <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-[#161b22] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#00d4ff]" />
            Accuracy Trend - Last 7 Days
          </h3>
          <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-full">Phase 5 Enhanced</span>
        </div>

        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            {type === 'line' ? (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#161b22', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  labelStyle={{ color: '#9ca3af' }}
                />
                <Line type="monotone" dataKey="accuracy" stroke="#00d4ff" strokeWidth={3} dot={{ fill: '#00d4ff', r: 4 }} activeDot={{ r: 6, fill: '#00d4ff' }} />
                {showConfidence && <Line type="monotone" dataKey="avgConfidence" stroke="#00ff88" strokeWidth={2} strokeDasharray="5 5" dot={false} />}
              </LineChart>
            ) : type === 'bar' ? (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#161b22', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                <Bar dataKey="accuracy" fill="#00d4ff" radius={[6, 6, 0, 0]} />
              </BarChart>
            ) : (
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00ff88" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#161b22', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} labelStyle={{ color: '#9ca3af' }} />
                <Area type="monotone" dataKey="accuracy" stroke="#00d4ff" strokeWidth={3} fill="url(#accuracyGradient)" dot={{ fill: '#00d4ff', r: 4 }} />
                {showConfidence && <Area type="monotone" dataKey="avgConfidence" stroke="#00ff88" strokeWidth={2} fill="url(#confidenceGradient)" dot={false} />}
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trend */}
        <div className="bg-[#161b22] border border-white/10 rounded-2xl p-6">
          <h4 className="text-white font-semibold mb-4 text-sm">Weekly Progress</h4>
          <div className="h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyAccuracy}>
                <XAxis dataKey="week" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} hide />
                <Tooltip contentStyle={{ backgroundColor: '#161b22', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                <Bar dataKey="accuracy" fill="#0066ff" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* By Prediction Type */}
        <div className="bg-[#161b22] border border-white/10 rounded-2xl p-6">
          <h4 className="text-white font-semibold mb-4 text-sm">Accuracy by Market</h4>
          <div className="space-y-3">
            {predictionTypes.map((item) => (
              <div key={item.type} className="flex items-center gap-3">
                <div className="w-20 text-xs text-gray-400 truncate">{item.type}</div>
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${item.accuracy}%`, backgroundColor: item.color }} />
                </div>
                <span className="text-xs text-white font-medium w-10 text-right">{item.accuracy}%</span>
                <span className="text-xs text-gray-600 w-12 text-right">{item.count} picks</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionAccuracyChart;
