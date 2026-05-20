import fs from 'fs';
import path from 'path';
import { getTMDBData } from "@/lib/tmdb";
import { cache } from 'react';

// Memoize file reading and parsing
const getLocalContent = cache(() => {
  try {
    const filePath = path.join(process.cwd(), 'data/content_index.json');
    const fileData = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileData);
  } catch (error) {
    console.error("Error reading content_index.json:", error);
    return [];
  }
});

export default async function Home() {
  const localContent = getLocalContent();

  const movies = localContent.filter((item: any) => item.folder === 'movie');
  const series = localContent.filter((item: any) => item.folder === 'tv');

  // Hero data from TMDB (trending)
  const trendingData = await getTMDBData("trending/all/day", { language: "ar" });
  const heroItem = trendingData?.results?.[0] || movies[0];
  const backdrop = heroItem?.backdrop_path
    ? `https://image.tmdb.org/t/p/original${heroItem.backdrop_path}`
    : heroItem?.poster || "";

  // Helper to limit items and improve rendering speed
  const LIMIT = 30;

  const sections = [
    { title: "جميع الأفلام",       items: movies.slice(0, LIMIT), type: 'movie' },
    { title: "جميع المسلسلات",     items: series.slice(0, LIMIT), type: 'tv' },
    { title: "أكشن وإثارة",        items: movies.filter((m: any) => m.genres?.includes('حركة')).slice(0, LIMIT), type: 'movie' },
    { title: "خيال علمي ومغامرة",  items: movies.filter((m: any) => m.genres?.includes('خيال علمي')).slice(0, LIMIT), type: 'movie' },
    { title: "دراما",              items: movies.filter((m: any) => m.genres?.includes('دراما')).slice(0, LIMIT), type: 'movie' },
    { title: "رعب وإثارة",         items: movies.filter((m: any) => m.genres?.includes('رعب')).slice(0, LIMIT), type: 'movie' },
    { title: "كوميديا",            items: movies.filter((m: any) => m.genres?.includes('كوميديا')).slice(0, LIMIT), type: 'movie' },
    { title: "عائلي",              items: movies.filter((m: any) => m.genres?.includes('عائلي')).slice(0, LIMIT), type: 'movie' },
    { title: "جريمة",              items: movies.filter((m: any) => m.genres?.includes('جريمة')).slice(0, LIMIT), type: 'movie' },
    { title: "مغامرة",             items: movies.filter((m: any) => m.genres?.includes('مغامرة')).slice(0, LIMIT), type: 'movie' },
    { title: "فانتازيا",           items: movies.filter((m: any) => m.genres?.includes('فانتازيا')).slice(0, LIMIT), type: 'movie' },
    { title: "رسوم متحركة",        items: movies.filter((m: any) => m.genres?.includes('رسوم متحركة')).slice(0, LIMIT), type: 'movie' },
    { title: "إثارة",              items: [...movies, ...series].filter((m: any) => m.genres?.includes('إثارة')).slice(0, LIMIT), type: 'movie' },
    { title: "غموض",               items: movies.filter((m: any) => m.genres?.includes('غموض')).slice(0, LIMIT), type: 'movie' },
    { title: "رومنسية",            items: movies.filter((m: any) => m.genres?.includes('رومنسية')).slice(0, LIMIT), type: 'movie' },
    { title: "تاريخ وحرب",         items: movies.filter((m: any) => m.genres?.includes('تاريخ') || m.genres?.includes('حرب')).slice(0, LIMIT), type: 'movie' },
  ].filter(s => s.items.length > 0);

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* ───── IMMERSIVE HERO ───── */}
      <section className="relative h-[95vh] w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
          style={{ backgroundImage: `url(${backdrop})` }}
        />
        <div className="absolute inset-0 hero-gradient-overlay" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />

        <div className="relative h-full flex flex-col justify-end pb-20 md:pb-32 px-6 md:px-12 lg:px-20 max-w-5xl fade-in-up">
          {/* Badge */}
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-primary/20 text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-primary/30 backdrop-blur-md shadow-[0_0_15px_rgba(255,100,0,0.1)]">
              حصرياً على توميتو
            </span>
            <span className="text-white/40 text-[10px] font-bold tracking-widest uppercase">Ultra HD 4K</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black mb-6 leading-[0.95] hero-title tracking-tighter">
            {heroItem?.title || heroItem?.name}
          </h1>

          {/* Description */}
          <p className="text-base md:text-xl text-white/70 mb-10 line-clamp-3 max-w-2xl leading-relaxed font-medium">
            {heroItem?.overview || "استمتع بمشاهدة أحدث الأفلام والمسلسلات الحصرية بجودة عالية وبدون إعلانات مزعجة. تجربة سينمائية فريدة في منزلك."}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4">
            <a
              href={`/${heroItem?.folder || 'movie'}/${heroItem?.slug}`}
              className="btn-primary"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              <span>مشاهدة الآن</span>
            </a>
            <button className="btn-secondary group">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:scale-110 transition-transform"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              <span>المزيد من المعلومات</span>
            </button>
          </div>
        </div>
      </section>

      {/* ───── CONTENT ROWS ───── */}
      <div className="relative z-10 -mt-24 pb-32 space-y-16">
        {sections.map((section, idx) => (
          <section key={idx} className="group">
            <div className="section-header mb-6">
              <h2 className="text-2xl md:text-3xl font-black tracking-tight group-hover:text-primary transition-colors">{section.title}</h2>
            </div>

            <div className="netflix-row hide-scrollbar px-6 md:px-12 lg:px-20">
              {section.items.map((item: any, i: number) => (
                <div
                  key={item.slug || i}
                  className="netflix-item"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <a
                    href={`/${item.folder || section.type}/${item.slug}`}
                    className="movie-card"
                  >
                    <img
                      src={item.poster ? item.poster.replace('https://image.tmdb.org/t/p/w500', '/t/p/w500') : (item.poster_path ? `/t/p/w500${item.poster_path}` : '')}
                      alt={item.title}
                      loading={idx < 2 ? "eager" : "lazy"}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="card-info bg-gradient-to-t from-black via-black/60 to-transparent pt-12">
                      <h3 className="text-xs font-bold text-white leading-tight line-clamp-2 mb-1">{item.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-primary font-black uppercase">⭐ {item.vote_average?.toFixed(1)}</span>
                        {item.genres?.[0] && (
                          <span className="text-[9px] text-white/40">{item.genres[0]}</span>
                        )}
                      </div>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
