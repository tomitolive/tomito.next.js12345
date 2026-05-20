import fs from 'fs';
import path from 'path';
import { getTMDBData } from "@/lib/tmdb";

function getLocalContent() {
  try {
    const filePath = path.join(process.cwd(), 'data/content_index.json');
    const fileData = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileData);
  } catch (error) {
    console.error("Error reading content_index.json:", error);
    return [];
  }
}

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

  const sections = [
    { title: "جميع الأفلام",       items: movies, type: 'movie' },
    { title: "جميع المسلسلات",     items: series, type: 'tv' },
    { title: "أكشن وإثارة",        items: movies.filter((m: any) => m.genres?.includes('حركة')), type: 'movie' },
    { title: "خيال علمي ومغامرة",  items: movies.filter((m: any) => m.genres?.includes('خيال علمي')), type: 'movie' },
    { title: "دراما",              items: movies.filter((m: any) => m.genres?.includes('دراما')), type: 'movie' },
    { title: "رعب وإثارة",         items: movies.filter((m: any) => m.genres?.includes('رعب')), type: 'movie' },
    { title: "كوميديا",            items: movies.filter((m: any) => m.genres?.includes('كوميديا')), type: 'movie' },
    { title: "عائلي",              items: movies.filter((m: any) => m.genres?.includes('عائلي')), type: 'movie' },
    { title: "جريمة",              items: movies.filter((m: any) => m.genres?.includes('جريمة')), type: 'movie' },
    { title: "مغامرة",             items: movies.filter((m: any) => m.genres?.includes('مغامرة')), type: 'movie' },
    { title: "فانتازيا",           items: movies.filter((m: any) => m.genres?.includes('فانتازيا')), type: 'movie' },
    { title: "رسوم متحركة",        items: movies.filter((m: any) => m.genres?.includes('رسوم متحركة')), type: 'movie' },
    { title: "إثارة",              items: [...movies, ...series].filter((m: any) => m.genres?.includes('إثارة')), type: 'movie' },
    { title: "غموض",               items: movies.filter((m: any) => m.genres?.includes('غموض')), type: 'movie' },
    { title: "رومنسية",            items: movies.filter((m: any) => m.genres?.includes('رومنسية')), type: 'movie' },
    { title: "تاريخ وحرب",         items: movies.filter((m: any) => m.genres?.includes('تاريخ') || m.genres?.includes('حرب')), type: 'movie' },
  ].filter(s => s.items.length > 0);

  return (
    <div className="bg-background">
      {/* ───── IMMERSIVE HERO ───── */}
      <section className="relative h-[95vh] w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backdrop})` }}
        />
        <div className="absolute inset-0 hero-gradient-overlay" />

        <div className="relative h-full flex flex-col justify-end pb-20 md:pb-28 px-6 md:px-12 lg:px-16 max-w-4xl fade-in-up">
          {/* Badge */}
          <div className="flex items-center gap-3 mb-5">
            <span className="bg-primary/15 text-primary px-3 py-1 rounded text-[11px] font-bold uppercase tracking-[0.15em] border border-primary/20">
              حصرياً
            </span>
            <span className="text-white/40 text-xs font-medium tracking-wide">HD مشاهدة بجودة</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black mb-5 leading-[1.05] hero-title tracking-tight">
            {heroItem?.title || heroItem?.name}
          </h1>

          {/* Description */}
          <p className="text-sm md:text-base text-white/60 mb-8 line-clamp-3 max-w-xl leading-relaxed">
            {heroItem?.overview || "استمتع بمشاهدة أحدث الأفلام والمسلسلات الحصرية بجودة عالية وبدون إعلانات مزعجة."}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-3">
            <a
              href={`https://tv.tomito.xyz/${heroItem?.folder || 'movie'}/${heroItem?.slug}`}
              className="btn-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              <span>مشاهدة الآن</span>
            </a>
            <button className="btn-secondary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              المزيد
            </button>
          </div>
        </div>
      </section>

      {/* ───── CONTENT ROWS ───── */}
      <div className="relative z-10 -mt-16 pb-20 space-y-10">
        {sections.map((section, idx) => (
          <section key={idx}>
            <div className="section-header">
              <h2>{section.title}</h2>
            </div>

            <div className="netflix-row hide-scrollbar px-6 md:px-12">
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
                    />
                    <div className="card-info">
                      <h3 className="text-[11px] font-bold text-white leading-tight line-clamp-2">{item.title}</h3>
                      {item.genres?.[1] && (
                        <span className="text-[9px] text-white/50 mt-0.5 block">{item.genres[1]}</span>
                      )}
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
