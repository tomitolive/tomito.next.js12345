import { getTMDBData } from "@/lib/tmdb";

export default async function Home() {
  const [trendingMovies, trendingTV, topRated] = await Promise.all([
    getTMDBData("trending/movie/day", { language: "ar" }),
    getTMDBData("trending/tv/day", { language: "ar" }),
    getTMDBData("movie/top_rated", { language: "ar" }),
  ]);

  const heroItem = trendingMovies?.results?.[0];
  const backdrop = heroItem?.backdrop_path ? `https://image.tmdb.org/t/p/original${heroItem.backdrop_path}` : "";

  const sections = [
    { title: "أفلام رائجة اليوم", items: trendingMovies?.results?.slice(0, 12), type: 'movie' },
    { title: "مسلسلات ننصح بها", items: trendingTV?.results?.slice(0, 12), type: 'tv' },
    { title: "الأعلى تقييماً", items: topRated?.results?.slice(0, 12), type: 'movie' },
  ];

  return (
    <div className="bg-black pb-24">
      {/* Cinematic Hero */}
      <section className="relative h-[85vh] w-full">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backdrop})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent" />
        
        <div className="relative h-full flex flex-col justify-center px-6 md:px-12 max-w-3xl fade-in">
          <span className="text-red-primary font-bold tracking-widest mb-4">حصرياً على توميتو</span>
          <h1 className="text-5xl md:text-8xl font-bold font-heading mb-6 leading-tight">
            {heroItem?.title || heroItem?.name}
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8 line-clamp-3 leading-relaxed">
            {heroItem?.overview}
          </p>
          <div className="flex gap-4">
            <a 
              href={`/movie/${heroItem?.id}-${(heroItem?.title || "").toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              className="bg-white text-black px-10 py-4 rounded-md font-bold text-lg hover:bg-white/90 transition-all transform hover:scale-105"
            >
              مشاهدة الآن
            </a>
          </div>
        </div>
      </section>

      {/* Content Rows */}
      <div className="px-6 md:px-12 -mt-32 relative z-10 space-y-16">
        {sections.map((section, idx) => (
          <section key={idx}>
            <h2 className="text-2xl font-bold font-heading mb-6 tracking-tight flex items-center gap-3">
               <span className="w-1 h-8 bg-red-primary rounded-full" />
               {section.title}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
               {section.items?.map((item: any) => {
                  const title = item.title || item.name;
                  const slug_raw = title.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, '-');
                  const slug = `${item.id}-${slug_raw}`;
                  return (
                    <a 
                      key={item.id} 
                      href={`/${section.type}/${slug}`}
                      className="movie-card group"
                    >
                      <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-zinc-900 shadow-xl border border-white/5">
                        <img 
                          src={`https://image.tmdb.org/t/p/w400${item.poster_path}`} 
                          alt={title} 
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <h3 className="mt-2 text-sm font-medium truncate text-gray-400 group-hover:text-white transition-colors">
                        {title}
                      </h3>
                    </a>
                  )
               })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
