function NewsSection({ title, items, icon }) {
  return (
    <div className="rounded-2xl bg-slate-900 p-6 shadow-lg ring-1 ring-slate-800 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">{icon}</span>
        <h3 className="text-lg font-semibold text-slate-200">{title}</h3>
      </div>
      <ul className="space-y-3">
        {items.map((item, idx) => (
          <li key={idx}>
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="block hover:underline">
              <p className="text-slate-100 leading-snug">{item.title}</p>
              <div className="text-xs text-slate-500 flex gap-2 mt-1">
                <span>{new Date(item.created_at).toLocaleDateString()}</span>
                <span>• {item.points} points</span>
                <span>• {item.comments} comments</span>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function News({ news }) {
  return (
    <section className="py-4">
      <h2 className="text-lg font-semibold text-slate-200 mb-4">Latest News</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <NewsSection title="Artificial Intelligence" items={news.ai} icon="🤖" />
        <NewsSection title="Vibe Coding" items={news.vibeCoding} icon="🎨" />
        <NewsSection title="Programming & Databases" items={news.progDb} icon="💾" />
      </div>
    </section>
  );
}