import React from 'react';
import { Newspaper, ArrowRight, Loader2, Wifi, Radio } from 'lucide-react';
import { useNews } from './useNewsHook';

const NewsFeed: React.FC = () => {
  const { articles, source, loading } = useNews() as any;

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Newspaper className="w-6 h-6 text-[#00d4ff]" />
              Latest News
            </h2>
            <div className="flex items-center gap-2 text-xs">
              {loading ? (
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-400">
                  <Loader2 className="w-3 h-3 animate-spin" /> Loading...
                </span>
              ) : source === 'api-live' ? (
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-400">
                  <Wifi className="w-3 h-3" /> Live API · TanStack Query
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#00d4ff]/10 border border-[#00d4ff]/20 rounded-full text-[#00d4ff]">
                  <Radio className="w-3 h-3" /> Demo News · Cached
                </span>
              )}
            </div>
          </div>
          <p className="text-gray-500 text-sm">Breaking news and updates from the sports world</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article: any) => (
            <article key={article.id} className="group bg-[#161b22] border border-white/5 rounded-xl overflow-hidden hover:border-[#00d4ff]/20 hover:bg-[#1c2333] transition-all cursor-pointer">
              <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[#00d4ff]/20 to-[#0066ff]/20">
                {article.image ? (
                  <img
                    src={article.image}
                    alt={article.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#00d4ff]/20 to-[#0066ff]/20" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-transparent" />
              </div>

              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{article.category}</span>
                  <span className="text-gray-700">|</span>
                  <span className="text-[10px] text-gray-500">{article.author}</span>
                </div>
                <h3 className="text-white font-bold text-base mb-2 line-clamp-2 group-hover:text-[#00d4ff] transition-colors">{article.title}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{article.excerpt}</p>
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-600">{article.time}</span>
                    <span className="text-gray-700">•</span>
                    <span className="text-gray-600">{article.readTime}</span>
                  </div>
                  <button className="flex items-center gap-1 text-[#00d4ff] hover:text-[#00e6ff] text-xs font-semibold transition-colors">
                    Read More <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsFeed;
