import { Metadata } from "next";
import { getTMDBData } from "@/lib/tmdb";
import { notFound } from "next/navigation";

interface Props {
  params: { slug: string };
}

const GENRE_MAP: Record<string, number> = {
    "action": 28,
    "adventure": 12,
    "animation": 16,
    "comedy": 35,
    "crime": 80,
    "documentary": 99,
    "drama": 18,
    "family": 10751,
    "fantasy": 14,
    "history": 36,
    "horror": 27,
    "music": 10402,
    "mystery": 9648,
    "romance": 10749,
    "sci-fi": 878,
    "tv-movie": 10770,
    "thriller": 53,
    "war": 10752,
    "western": 37,
};

const GENRE_AR: Record<string, string> = {
    "action": "أكشن",
    "adventure": "مغامرة",
    "animation": "أنمي",
    "comedy": "كوميديا",
    "crime": "جريمة",
    "drama": "دراما",
    "horror": "رعب",
    "sci-fi": "خيال علمي",
    "thriller": "إثارة",
    "romance": "رومانسية",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const genreName = GENRE_AR[slug] || slug;
  return {
    title: `أفلام ومسلسلات ${genreName} — توميتو`,
    description: `مشاهدة وتحميل أفضل أفلام ومسلسلات ${genreName} مترجمة باحترافية وبدون إعلانات.`,
  };
}

export default async function GenrePage({ params }: Props) {
  const { slug } = await params;
  const genreId = GENRE_MAP[slug];
  if (!genreId) notFound();

  const movies = await getTMDBData("discover/movie", { with_genres: genreId.toString(), language: "ar" });
  const tv = await getTMDBData("discover/tv", { with_genres: genreId.toString(), language: "ar" });

  const items = [
    ...(movies?.results || []).map((m: any) => ({ ...m, media_type: 'movie' })),
    ...(tv?.results || []).map((t: any) => ({ ...t, media_type: 'tv' }))
  ].sort((a, b) => b.vote_average - a.vote_average);

  const genreName = GENRE_AR[slug] || slug;

  return (
    <div className="bg-background text-foreground min-h-screen pt-32 pb-24 relative overflow-hidden">
      {/* Decorative Gradient */}
      <div className="absolute top-0 right-0 w-[50vw] h-[50vh] bg-primary/5 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-0 left-0 w-[40vw] h-[40vh] bg-primary/3 blur-[100px] rounded-full -z-10" />

      <header className="px-6 md:px-12 lg:px-20 mb-16 fade-in">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-1.5 h-10 bg-primary rounded-full shadow-[0_0_15px_var(--primary)]" />
          <h1 className="text-4xl md:text-6xl font-black font-heading tracking-tighter">
             تصفح تصنيف: <span className="text-primary">{genreName}</span>
          </h1>
        </div>
        <p className="text-muted max-w-2xl text-lg font-medium leading-relaxed border-r-2 border-white/5 pr-6">
           اكتشف عالم {genreName} مع أفضل الأفلام والمسلسلات المختارة بعناية. تجربة مشاهدة فريدة بجودة 4K وبدون إعلانات.
        </p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 px-6 md:px-12 lg:px-20">
        {items.map((item: any, i: number) => {
          const type = item.media_type;
          const title = item.title || item.name;
          const slug_raw = title.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, '-');
          const itemSlug = `${item.id}-${slug_raw}`;
          
          return (
            <div key={`${type}-${item.id}`} style={{ animationDelay: `${i * 30}ms` }} className="fade-in-up">
              <a 
                href={`/${type}/${itemSlug}`}
                className="movie-card"
              >
                <img 
                  src={item.poster_path ? `/t/p/w500${item.poster_path}` : ''} 
                  alt={title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  loading="lazy"
                />
                <div className="card-info bg-gradient-to-t from-black via-black/60 to-transparent pt-12">
                   <h3 className="text-xs font-bold text-white leading-tight line-clamp-2 mb-1">{title}</h3>
                   <div className="flex items-center gap-2">
                      <span className="text-[9px] text-primary font-black">⭐ {item.vote_average?.toFixed(1)}</span>
                      <span className="text-[9px] text-white/40">{type === 'movie' ? 'فيلم' : 'مسلسل'} • {(item.release_date || item.first_air_date || '').substring(0, 4)}</span>
                   </div>
                </div>
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
