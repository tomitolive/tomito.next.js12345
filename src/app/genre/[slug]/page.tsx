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
    <div className="bg-black min-h-screen pt-24 px-6 md:px-12 pb-24">
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4 text-red-primary">
           تصنيف: {genreName}
        </h1>
        <p className="text-gray-400 max-w-2xl text-lg">
           استكشف مجموعة مختارة من أفضل أعمال {genreName} المتاحة حالياً للمشاهدة.
        </p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {items.map((item: any) => {
          const type = item.media_type;
          const title = item.title || item.name;
          const slug_raw = title.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, '-');
          const slug = `${item.id}-${slug_raw}`;
          
          return (
            <a 
              key={`${type}-${item.id}`} 
              href={`/${type}/${slug}`}
              className="movie-card group"
            >
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-zinc-900 border border-white/5 shadow-lg">
                <img 
                  src={`/t/p/w500${item.poster_path}`} 
                  alt={title} 
                  className="w-full h-full object-cover" 
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                   <span className="text-xs font-bold text-red-primary">مشاهدة الآن</span>
                </div>
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold">
                   {item.vote_average?.toFixed(1)} ⭐
                </div>
              </div>
              <h3 className="mt-3 text-sm font-medium text-gray-300 group-hover:text-white truncate transition-colors">
                {title}
              </h3>
              <p className="text-[10px] text-gray-500 mt-1">
                {type === 'movie' ? 'فيلم' : 'مسلسل'} • {(item.release_date || item.first_air_date || '').substring(0, 4)}
              </p>
            </a>
          );
        })}
      </div>
    </div>
  );
}
