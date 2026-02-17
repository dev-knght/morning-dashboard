import { useEffect, useState } from 'react';

export default function DateDisplay() {
  const [dateTime, setDateTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      // Convert to Asia/Amman timezone (Jordan, UTC+2/UTC+3 depending on DST)
      const options = {
        timeZone: 'Asia/Amman',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      };
      setDateTime(now.toLocaleString('en-JO', options));
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-center py-4">
      <h1 className="text-2xl font-bold text-slate-100">Morning Dashboard</h1>
      <p className="text-slate-400 text-sm">{dateTime}</p>
    </div>
  );
}