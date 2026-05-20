import { Metadata } from "next";
import { getDetails, IMAGE_BASE_URL } from "@/lib/tmdb";
import { getLocalContent } from "@/lib/content";
import { notFound } from "next/navigation";

interface Props {
  params: { slug: string };
}

// Function to extract ID from slug (e.g., "123-slug" -> "123")
function parseId(slug: string) {
  const match = slug.match(/^(\d+)/);
  return match ? match[1] : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const id = parseId(slug);
  if (!id) return { title: "فيلم غير موجود" };

  const local = await getLocalContent(id);
  if (local?.ai_content?.meta_desc) {
    return {
      title: `${local.title} — مشاهدة وتحميل اون لاين`,
      description: local.ai_content.meta_desc,
      keywords: local.ai_content.keywords,
    };
  }

  const details = await getDetails(id, "movie");
  if (!details || !details.ar) return { title: "فيلم غير موجود" };

  const title = details.ar.title || details.ar.name;
  const description = details.ar.overview || "";

  return {
    title: `${title} — مشاهدة وتحميل اون لاين`,
    description: description.substring(0, 160),
    openGraph: {
      images: [details.ar.poster_path ? `https://image.tmdb.org/t/p/w500${details.ar.poster_path}` : ""],
    },
  };
}

export default async function MoviePage({ params }: Props) {
  const { slug } = await params;
  const id = parseId(slug);
  if (!id) notFound();

  const local = await getLocalContent(id);
  const details = !local ? await getDetails(id, "movie") : null;
  
  if (!local && (!details || (!details.ar && !details.en))) notFound();

  const data = local || (details!.ar || details!.en);
  const ai = local?.ai_content;
  
  const title = data.title;
  const overview = ai?.desc_ar || data.overview;
  const year = (data.release_date || "2026").substring(0, 4);
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
            <span className="border border-white/20 px-2 py-0.5 rounded text-xs">HD</span>
            <span className="hidden sm:inline border-r border-white/10 pr-4">{genres}</span>
          </div>
          <p className="text-sm md:text-xl text-gray-200 line-clamp-3 mb-8 max-w-2xl leading-relaxed">
            {data.overview}
          </p>
          <div className="flex flex-wrap gap-4">
            <a 
              href={`https://tv.tomito.xyz/movie/${slug}`}
              className="btn-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              <span>مشاهدة الآن</span>
            </a>
            <button className="btn-secondary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              <span>تحميل</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-6 md:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Main Info */}
          <div className="md:col-span-3 space-y-12">
            <section>
              <h2 className="text-2xl font-bold font-heading mb-6 border-r-4 border-primary pr-4">القصة</h2>
              <p className="text-gray-300 text-lg leading-loose text-justify">
                {data.overview}
              </p>
            </section>

             {/* Similar Movies */}
             {details?.similar?.results && (
             <section>
                <h2 className="text-2xl font-bold font-heading mb-6 border-r-4 border-primary pr-4">أفلام مشابهة</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                   {details.similar.results.slice(0, 5).map((item: any) => (
                      <div key={item.id} className="movie-card group cursor-pointer">
                         <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-zinc-900 border border-white/5">
                            <img 
                              src={`https://image.tmdb.org/t/p/w300${item.poster_path}`} 
                              alt={item.title} 
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                               <span className="text-white font-bold text-sm">التفاصيل</span>
                            </div>
                         </div>
                         <h3 className="mt-2 text-sm font-medium truncate text-gray-400 group-hover:text-white transition-colors">{item.title}</h3>
                      </div>
                   ))}
                </div>
             </section>
             )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-card-bg p-6 rounded-xl border border-white/5 sticky top-24">
              <img src={poster} alt={title} className="w-full rounded-lg shadow-2xl mb-6 border border-white/10" />
              <div className="space-y-4 text-sm">
                 <div>
                    <span className="text-gray-500 block mb-1">النوع</span>
                    <span className="text-white">{genres}</span>
                 </div>
                 <div>
                    <span className="text-gray-500 block mb-1">تاريخ الإصدار</span>
                    <span className="text-white">{data.release_date}</span>
                 </div>
                 <div>
                    <span className="text-gray-500 block mb-2">التقييم العام</span>
                    <span className="rating-badge">{rating} / 10</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
