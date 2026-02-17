const JOD_PER_USD = 0.709; // Fixed peg rate (approximate)

export default function Metals({ metals }) {
  const goldJOD = +(metals.goldUSD * JOD_PER_USD).toFixed(2);
  const oilJOD = +(metals.oilUSD * JOD_PER_USD).toFixed(2);

  return (
    <section className="py-4">
      <h2 className="text-lg font-semibold text-slate-200 mb-4">Precious Metals & Oil</h2>
      <div className="grid grid-cols-2 gap-6">
        {/* Gold */}
        <div className="rounded-2xl bg-slate-900 p-6 shadow-lg ring-1 ring-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🥇</span>
            <h3 className="text-slate-400 text-sm">Gold (XAU)</h3>
          </div>
          <p className="text-2xl font-bold text-slate-100">${metals.goldUSD}</p>
          <p className="text-slate-300">{goldJOD} JOD</p>
        </div>

        {/* Oil */}
        <div className="rounded-2xl bg-slate-900 p-6 shadow-lg ring-1 ring-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🛢️</span>
            <h3 className="text-slate-400 text-sm">Oil (WTI)</h3>
          </div>
          <p className="text-2xl font-bold text-slate-100">${metals.oilUSD}</p>
          <p className="text-slate-300">{oilJOD} JOD</p>
        </div>
      </div>
      <p className="text-xs text-slate-500 mt-2">Prices updated: {new Date(metals.updatedAt).toLocaleTimeString()}</p>
    </section>
  );
}