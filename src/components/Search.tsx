"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = async (val: string) => {
    setQuery(val);
    if (val.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    try {
      const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=882e741f7283dc9ba1654d4692ec30f6&query=${encodeURIComponent(val)}&language=ar&page=1`);
      const data = await res.json();
      setResults(data.results?.slice(0, 8) || []);
      setIsOpen(true);
    } catch (e) {
      console.error("Search error", e);
    }
  };

  const handleSelect = (item: any) => {
    const type = item.media_type === 'movie' ? 'movie' : 'tv';
    const title = item.title || item.name;
    const slug_raw = title.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, '-');
    const slug = `${item.id}-${slug_raw}`;
    router.push(`/${type}/${slug}`);
    setIsOpen(false);
    setQuery("");
  };

  return (
    <div className="relative group w-full max-w-sm" ref={searchRef}>
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="ابحث عن فيلم أو مسلسل..."
        className="w-full bg-input border border-white/5 rounded-full py-2.5 px-10 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-gray-600"
      />
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-card-bg border border-white/5 rounded-xl overflow-hidden shadow-2xl z-[100] backdrop-blur-xl">
          {results.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelect(item)}
              className="w-full flex items-center gap-3 p-3 hover:bg-primary/10 transition-colors border-b border-white/5 last:border-0"
            >
              <img 
                src={item.poster_path ? `/t/p/w500${item.poster_path}` : "/favicon.ico"} 
                alt={item.title || item.name}
                className="w-10 h-14 object-cover rounded shadow"
              />
              <div className="text-right">
                <div className="text-sm font-bold text-white truncate max-w-[200px]">{item.title || item.name}</div>
                <div className="text-[10px] text-gray-500">
                   {item.media_type === 'movie' ? 'فيلم' : 'مسلسل'} • {(item.release_date || item.first_air_date || '').substring(0, 4)}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
