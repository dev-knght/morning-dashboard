export default function Weather({ current, tomorrow }) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
      {/* Today */}
      <div className="rounded-2xl bg-slate-900 p-6 shadow-lg ring-1 ring-slate-800">
        <h2 className="text-lg font-semibold text-slate-200 mb-4">Today's Weather (Irbid)</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-slate-400 text-sm">Temperature</p>
            <p className="text-2xl font-bold text-slate-100">{current.temp_c}°C</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Humidity</p>
            <p className="text-2xl font-bold text-slate-100">{current.humidity}%</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Wind</p>
            <p className="text-2xl font-bold text-slate-100">{current.wind_kph} km/h</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Condition</p>
            <p className="text-lg font-medium text-slate-200">{current.weather_desc}</p>
          </div>
        </div>
      </div>

      {/* Tomorrow */}
      <div className="rounded-2xl bg-slate-900 p-6 shadow-lg ring-1 ring-slate-800">
        <h2 className="text-lg font-semibold text-slate-200 mb-4">Tomorrow's Forecast</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-slate-400 text-sm">High / Low</p>
            <p className="text-2xl font-bold text-slate-100">{tomorrow.temp_max_c}° / {tomorrow.temp_min_c}°</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Humidity</p>
            <p className="text-2xl font-bold text-slate-100">{tomorrow.humidity_min}% — {tomorrow.humidity_max}%</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Wind</p>
            <p className="text-2xl font-bold text-slate-100">{tomorrow.wind_kph} km/h</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Condition</p>
            <p className="text-lg font-medium text-slate-200">{tomorrow.weather_desc}</p>
          </div>
        </div>
      </div>
    </section>
  );
}