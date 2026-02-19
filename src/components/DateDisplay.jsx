import { useEffect, useState } from 'react';

export default function DateDisplay() {
  const [dateTime, setDateTime] = useState('');
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      // Get hour in Asia/Amman
      const hour = parseInt(
        now.toLocaleString('en-US', {
          timeZone: 'Asia/Amman',
          hour: 'numeric',
          hour12: false,
        }),
        10
      );

      let greet;
      if (hour < 5) greet = 'Good night';
      else if (hour < 12) greet = 'Good morning';
      else if (hour < 18) greet = 'Good afternoon';
      else if (hour < 22) greet = 'Good evening';
      else greet = 'Good night';

      setGreeting(greet);

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
      <h1 className="text-2xl font-bold text-slate-100">{greeting}!</h1>
      <p className="text-slate-400 text-sm">{dateTime}</p>
    </div>
  );
}