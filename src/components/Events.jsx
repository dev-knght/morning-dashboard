export default function Events({ events }) {
  if (!events || events.length === 0) return null;

  // Format date like "20 Feb" or "Wed 20 Feb"
  const formatDate = dateStr => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  // Compute days from today
  const today = new Date().toISOString().split('T')[0];
  const getDays = dateStr => {
    const diff = (new Date(dateStr) - new Date(today)) / (1000 * 60 * 60 * 24);
    return Math.round(diff);
  };

  return (
    <section className="py-4">
      <h2 className="text-lg font-semibold text-slate-200 mb-4">Events & Holidays</h2>
      <div className="space-y-3">
        {events.slice(0, 8).map((ev, idx) => {
          const days = getDays(ev.date);
          let badge = null;
          if (days === 0) badge = <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">Today</span>;
          else if (days > 0) badge = <span className="text-xs text-slate-500">in {days} day{days > 1 ? 's' : ''}</span>;
          else badge = <span className="text-xs text-red-400">passed</span>;

          return (
            <div key={idx} className="rounded-2xl bg-slate-900 p-4 shadow-lg ring-1 ring-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div className="text-2xl">
                  {ev.type === 'Public Holiday' ? '🎉' : ev.type === 'Religious' ? '🌙' : ev.type === 'National' ? '🇯🇴' : '📅'}
                </div>
                <div>
                  <p className="text-slate-100 font-medium">{ev.name}</p>
                  <p className="text-xs text-slate-500">
                    {formatDate(ev.date)} {ev.type && `• ${ev.type}`}
                  </p>
                </div>
              </div>
              {badge}
            </div>
          );
        })}
      </div>
      {events.length > 8 && (
        <p className="text-xs text-slate-600 mt-2">+{events.length - 8} more events</p>
      )}
    </section>
  );
}