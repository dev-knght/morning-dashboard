export default function PrayerTimes({ prayer }) {
  if (!prayer) return null;

  return (
    <section className="py-4">
      <h2 className="text-lg font-semibold text-slate-200 mb-4">Prayer Times (Amman)</h2>
      <div className="grid grid-cols-2 gap-6">
        {/* Sehar (Fajr) */}
        <div className="rounded-2xl bg-slate-900 p-6 shadow-lg ring-1 ring-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🌙</span>
            <h3 className="text-slate-400 text-sm">Sehar (Fajr)</h3>
          </div>
          <p className="text-2xl font-bold text-slate-100">{prayer.fajr}</p>
        </div>

        {/* Iftar (Maghrib) */}
        <div className="rounded-2xl bg-slate-900 p-6 shadow-lg ring-1 ring-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🌅</span>
            <h3 className="text-slate-400 text-sm">Iftar (Maghrib)</h3>
          </div>
          <p className="text-2xl font-bold text-slate-100">{prayer.maghrib}</p>
        </div>
      </div>
      <p className="text-xs text-slate-500 mt-2">{prayer.date}</p>
    </section>
  );
}