import { Metadata } from "next";
import { getDetails } from "@/lib/tmdb";
import { getLocalContent } from "@/lib/content";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

function parseId(slug: string) {
  if (!slug) return null;
  const match = slug.match(/^(\d+)/);
  return match ? match[1] : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const id = parseId(slug);
  if (!id) return { title: "مسلسل غير موجود" };

  const local = await getLocalContent(id);
  if (local?.ai_content?.meta_desc) {
    return {
      title: `مشاهدة مسلسل ${local.title} مترجم — توميتو`,
      description: local.ai_content.meta_desc,
    };
  }

  const details = await getDetails(id, "tv");
  if (!details || !details.ar) return { title: "مسلسل غير موجود" };

  const title = details.ar.name || details.ar.original_name;
  return {
    title: `مشاهدة مسلسل ${title} مترجم — توميتو`,
    description: details.ar.overview?.substring(0, 160),
  };
}

export default async function TVPage({ params }: Props) {
  const { slug } = await params;
  const id = parseId(slug);
  if (!id) notFound();

  const local = await getLocalContent(id);
  const details = !local ? await getDetails(id, "tv") : null;
  
  if (!local && (!details || (!details.ar && !details.en))) notFound();

  const data = local || (details!.ar || details!.en);
  const ai = local?.ai_content;
  
  const title = data.title;
  const overview = ai?.desc_ar || data.overview;
  const year = (data.first_air_date || "2026").substring(0, 4);
  const rating = data.vote_average?.toFixed(1);
  const genres = data.genres?.map((g: any) => g.name).join(" • ");
  const backdrop = data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : "";
  const poster = data.poster_path ? `/t/p/w500${data.poster_path}` : (data.poster ? data.poster.replace('https://image.tmdb.org/t/p/w500', '/t/p/w500') : "");

  return (
    <div className="relative min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-[70vh] w-full overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${backdrop})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/20 to-transparent" />
        
        <div className="relative h-full flex flex-col justify-end px-6 pb-12 md:px-12 md:pb-24 max-w-4xl fade-in-up">
          <h1 className="text-4xl md:text-7xl font-bold font-heading mb-4 leading-tight">
            {title}
          </h1>
          <div className="flex items-center gap-4 text-sm md:text-lg mb-6 font-medium text-gray-400">
            <span className="rating-badge">
              <span className="text-[10px] sm:text-xs">⭐</span>
              {rating}
            </span>
            <span>{year}</span>
            <span className="border border-white/20 px-2 py-0.5 rounded text-xs uppercase tracking-wider">TV Series</span>
            <span className="hidden sm:inline border-r border-white/10 pr-4">{genres}</span>
          </div>
          <p className="text-sm md:text-xl text-gray-200 line-clamp-3 mb-8 max-w-2xl leading-relaxed">
            {data.overview}
          </p>
          <div className="flex flex-wrap gap-4">
            <a 
              href={`https://tv.tomito.xyz/tv/${slug}`}
              className="btn-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              <span>مشاهدة جميع الحلقات</span>
            </a>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-3 space-y-12">
            <section>
              <h2 className="text-2xl font-bold font-heading mb-6 border-r-4 border-primary pr-4">القصة</h2>
              <p className="text-gray-300 text-lg leading-loose">
                {data.overview}
              </p>
            </section>
            
            {/* Seasons Info */}
            <section>
              <h2 className="text-2xl font-bold font-heading mb-6 border-r-4 border-primary pr-4">المواسم ({data.number_of_seasons})</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                 {data.seasons?.map((season: any) => (
                    <div key={season.id} className="episode-card group overflow-hidden">
                       <img src={season.poster_path ? `https://image.tmdb.org/t/p/w200${season.poster_path}` : poster} alt={season.name} className="w-full aspect-[2/3] object-cover transition-transform duration-500 group-hover:scale-105" />
                       <div className="p-3 border-t border-white/5">
                          <h4 className="text-sm font-bold truncate group-hover:text-primary transition-colors">{season.name}</h4>
                          <p className="text-xs text-gray-500">{season.episode_count} حلقة</p>
                       </div>
                    </div>
                 ))}
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <div className="bg-card-bg p-6 rounded-xl border border-white/5 sticky top-24">
              <img src={poster} alt={title} className="w-full rounded-lg shadow-2xl mb-6" />
              <div className="space-y-4 text-sm">
                 <div>
                    <span className="text-gray-500 block mb-1">الحالة</span>
                    <span className="text-white">{data.status === 'Ended' ? 'منتهي' : 'مستمر'}</span>
                 </div>
                 <div>
                    <span className="text-gray-500 block mb-1">عدد الحلقات</span>
                    <span className="text-white">{data.number_of_episodes} حلقة</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
