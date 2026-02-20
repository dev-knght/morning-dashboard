import { useEffect, useState } from 'react';
import DateDisplay from './components/DateDisplay';
import Weather from './components/Weather';
import Metals from './components/Metals';
import ExchangeRates from './components/ExchangeRates';
import PrayerTimes from './components/PrayerTimes';
import News from './components/News';

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('data/dashboard.json')
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        <p>Loading morning briefing…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        <p>Failed to load data: {error}</p>
      </div>
    );
  }

  const { weather, metals, exchange, prayer, news } = data;

  return (
    <div className="min-h-screen bg-slate-950 max-w-6xl mx-auto px-4 py-6">
      <DateDisplay />
      <Weather current={weather.current} tomorrow={weather.tomorrow} />
      <Metals metals={metals} />
      <ExchangeRates exchange={exchange} />
      <PrayerTimes prayer={prayer} />
      <News news={news} />
      <footer className="text-center text-slate-600 text-xs py-6">
        Last updated: {new Date(data.updatedAt).toLocaleString()} (Asia/Amman)
      </footer>
    </div>
  );
}