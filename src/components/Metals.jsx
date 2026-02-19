export default function Metals({ metals }) {
  const oilJOD = +(metals.oilUSD * 0.709).toFixed(2);

  return (
    <section className="py-4">
      <h2 className="text-lg font-semibold text-slate-200 mb-4">Precious Metals & Oil</h2>
      <div className="grid grid-cols-2 gap-6">
        {/* Gold details */}
        <div className="rounded-2xl bg-slate-900 p-6 shadow-lg ring-1 ring-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🥇</span>
            <h3 className="text-slate-400 text-sm">Gold (XAU) per gram</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">24K</span>
              <span className="text-slate-100">${metals.gold24KUSD} / {metals.gold24KJD} JOD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">21K</span>
              <span className="text-slate-100">${metals.gold21KUSD} / {metals.gold21KJD} JOD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">18K</span>
              <span className="text-slate-100">${metals.gold18KUSD} / {metals.gold18KJD} JOD</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">Spot: ${metals.goldUSD} / oz</p>
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