export default function ExchangeRates({ exchange }) {
  // exchange: { JOD: number, EUR: number, GBP: number, SAR: number }
  const currencies = [
    { code: 'JOD', name: 'Jordanian Dinar', flag: '🇯🇴' },
    { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
    { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
    { code: 'SAR', name: 'Saudi Riyal', flag: '🇸🇦' },
  ];

  return (
    <section className="py-4">
      <h2 className="text-lg font-semibold text-slate-200 mb-4">Exchange Rates (1 USD)</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {currencies.map(cur => (
          <div key={cur.code} className="rounded-2xl bg-slate-900 p-4 shadow-lg ring-1 ring-slate-800">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{cur.flag}</span>
              <h3 className="text-slate-400 text-sm">{cur.code}</h3>
            </div>
            <p className="text-xl font-bold text-slate-100">{exchange[cur.code]?.toFixed(4) ?? '—'}</p>
            <p className="text-xs text-slate-500 truncate">{cur.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}