import { ArrowRightLeft, Loader2, Radio, Wifi } from 'lucide-react';
import { useTransfers } from './useTransfersHook';

const TransfersFeed: React.FC = () => {
  const { transfers, source, loading } = useTransfers();

  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-3 text-2xl font-bold text-white">
              <ArrowRightLeft className="h-6 w-6 text-[#00d4ff]" />
              Latest Transfers
            </h2>
            <p className="mt-2 text-sm text-gray-500">The latest football moves from clubs around the world</p>
          </div>
          <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#00d4ff]/20 bg-[#00d4ff]/10 px-2.5 py-1 text-xs text-[#00d4ff]">
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : source === 'api-live' ? <Wifi className="h-3 w-3" /> : <Radio className="h-3 w-3" />}
            {loading ? 'Loading' : source === 'api-live' ? 'Live data' : 'Demo data'}
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {transfers.map((transfer) => (
            <article key={transfer.id} className="rounded-xl border border-white/5 bg-[#161b22] p-4 transition-colors hover:border-[#00d4ff]/20 hover:bg-[#1c2333]">
              <div className="mb-4 flex items-start justify-between gap-3">
                <h3 className="font-semibold text-white">{transfer.player}</h3>
                <span className="shrink-0 text-[10px] uppercase tracking-wider text-gray-500">{transfer.date}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="min-w-0 flex-1 truncate rounded-lg bg-white/5 px-2.5 py-2 text-gray-400">{transfer.from}</span>
                <ArrowRightLeft className="h-4 w-4 shrink-0 text-[#00d4ff]" />
                <span className="min-w-0 flex-1 truncate rounded-lg bg-[#00d4ff]/10 px-2.5 py-2 text-[#00d4ff]">{transfer.to}</span>
              </div>
              <p className="mt-3 text-xs text-gray-500">Fee: <span className="text-gray-300">{transfer.fee}</span></p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TransfersFeed;
