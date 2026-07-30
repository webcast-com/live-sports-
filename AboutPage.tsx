import { TEAM_MEMBERS, STATS } from '../data/mockData';
import { Card, CardContent, Button } from '../components/ui';
import { Trophy, Target, TrendingUp, Users, Globe, Shield, ChevronRight } from 'lucide-react';

export function AboutPage({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  return (
    <div className="space-y-12 max-w-5xl mx-auto">
      {/* Hero */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-4 py-2 rounded-full text-sm font-semibold">
          <Trophy className="w-4 h-4" /> About FootyPredict AI
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
          Data-Driven Football<br />Predictions You Can Trust
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          We combine deep statistical analysis, machine learning, and football expertise to deliver
          the most accurate betting tips on the planet.
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Target, label: 'Total Predictions', value: `${(STATS.totalPredictions / 1000).toFixed(1)}K+` },
          { icon: TrendingUp, label: 'Overall Win Rate', value: `${STATS.overallWinRate}%` },
          { icon: Globe, label: 'Leagues Covered', value: `${STATS.leaguesCovered}+` },
          { icon: Users, label: 'Active Users', value: `${(STATS.activeUsers / 1000).toFixed(0)}K+` },
        ].map(stat => (
          <Card key={stat.label} className="text-center">
            <CardContent className="p-5">
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <stat.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</div>
              <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Our Story */}
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Our Story</h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            FootyPredict was founded in 2019 by a group of data scientists and football enthusiasts who were frustrated
            by the quality of predictions available online. Most tips were based on gut feeling — we decided to change that.
          </p>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            Our proprietary AI model processes over 200 data points per match — from historical head-to-head records
            and team form to weather conditions, player injury reports, and referee tendencies.
          </p>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            In 5 years, we've grown from a small Discord community to a platform trusted by thousands of bettors worldwide.
            Our premium members see an average monthly ROI of {STATS.monthlyROI}%.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Data Points Analysed', value: '200+', sub: 'per match', color: 'from-blue-500 to-indigo-600' },
            { label: 'Premium Win Rate', value: `${STATS.premiumWinRate}%`, sub: 'verified results', color: 'from-emerald-500 to-green-600' },
            { label: 'Founded', value: '2019', sub: 'London, UK', color: 'from-purple-500 to-violet-600' },
            { label: 'Monthly ROI', value: `+${STATS.monthlyROI}%`, sub: 'avg for premium', color: 'from-amber-500 to-orange-600' },
          ].map(item => (
            <div key={item.label} className={`bg-gradient-to-br ${item.color} rounded-2xl p-5 text-white`}>
              <div className="text-3xl font-black mb-1">{item.value}</div>
              <div className="text-sm font-semibold">{item.label}</div>
              <div className="text-xs text-white/70 mt-0.5">{item.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center">How Our AI Works</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              step: '01',
              title: 'Data Collection',
              desc: 'We ingest real-time data from 42+ leagues: team form, H2H history, injury reports, line-ups, weather, and more.',
              color: 'bg-blue-500',
            },
            {
              step: '02',
              title: 'AI Analysis',
              desc: 'Our ML model evaluates 200+ variables and runs thousands of simulations to generate confidence-weighted predictions.',
              color: 'bg-indigo-500',
            },
            {
              step: '03',
              title: 'Expert Review',
              desc: 'Human experts validate every AI pick before publishing, adding qualitative insight the algorithm might miss.',
              color: 'bg-violet-500',
            },
          ].map(step => (
            <div key={step.step} className="flex flex-col gap-4">
              <div className={`w-12 h-12 ${step.color} rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg`}>
                {step.step}
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{step.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center">Meet the Team</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TEAM_MEMBERS.map(member => (
            <Card key={member.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-5 text-center">
                <div className="text-4xl mb-3">{member.avatar}</div>
                <h3 className="font-bold text-slate-900 dark:text-white">{member.name}</h3>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-2">{member.role}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">{member.bio}</p>
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-center">
                    <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{member.winRate}</div>
                    <div className="text-xs text-slate-400">Win Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{member.predictions.toLocaleString()}</div>
                    <div className="text-xs text-slate-400">Picks</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Values */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center">Our Values</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: Shield, title: 'Transparency', desc: 'Every result is publicly logged and verified. We never hide losses.' },
            { icon: TrendingUp, title: 'Accuracy First', desc: 'We would rather give fewer, higher-quality picks than flood you with noise.' },
            { icon: Users, title: 'Community', desc: 'We grow with our users. Member feedback drives product improvements.' },
          ].map(val => (
            <Card key={val.title}>
              <CardContent className="p-5 flex gap-4 items-start">
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center shrink-0">
                  <val.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{val.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{val.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA */}
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-none text-white">
        <CardContent className="p-8 text-center">
          <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Ready to Start Winning?</h2>
          <p className="text-slate-300 mb-6 max-w-md mx-auto">Join thousands of bettors who trust FootyPredict AI every week.</p>
          <div className="flex gap-3 justify-center">
            <Button variant="premium" size="lg" onClick={() => setActiveTab('premium')}>
              Get Premium Access <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
            <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10" onClick={() => setActiveTab('predictions')}>
              Browse Free Picks
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
