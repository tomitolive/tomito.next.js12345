import { Metadata } from "next";
import { getDetails } from "@/lib/tmdb";
import { getLocalContent } from "@/lib/content";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";

interface Props {
  params: Promise<{ slug: string }>;
}

function parseId(slug: string) {
  const match = slug.match(/^(\d+)/);
  return match ? match[1] : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const id = parseId(slug);
  if (!id) return { title: "فيلم غير موجود" };

  const local = await getLocalContent(id);
  const canonicalUrl = `https://tomito.xyz/movie/${slug}`;

  if (local?.ai_content?.meta_desc) {
    return {
      title: `${local.title} — مشاهدة وتحميل اون لاين`,
      description: local.ai_content.meta_desc,
      keywords: local.ai_content.keywords,
      alternates: { canonical: canonicalUrl }
    };
  }

  const details = await getDetails(id, "movie");
  if (!details || !details.ar) return { title: "فيلم غير موجود" };

  const title = details.ar.title || details.ar.name;
  const year = (details.ar.release_date || "").substring(0, 4);
  return {
    title: `${title} — مشاهدة وتحميل اون لاين`,
    description: details.ar.overview?.substring(0, 160),
    keywords: `${title}, فيلم ${title}, مشاهدة ${title}, تحميل ${title}, ${title} اون لاين, ${title} مترجم, ${title} ${year}, فيلم ${title} كامل, افلام اون لاين`,
    alternates: { canonical: canonicalUrl },
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
  const details = await getDetails(id, "movie");
  
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

  // Find Trailer
  const trailer = details?.videos?.results?.find(
    (v: any) => v.type === "Trailer" && v.site === "YouTube"
  ) || details?.videos?.results?.[0];

  const movieSchema = {
    "@context": "https://schema.org",
    "@type": "Movie",
    "name": title,
    "image": `https://tomito.xyz${poster}`,
    "description": overview,
    "datePublished": data.release_date,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": rating,
      "bestRating": "10",
      "worstRating": "1",
      "ratingCount": data.vote_count || "100"
    }
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(movieSchema) }}
      />
      
      {/* Hero Section */}
      <div className="relative min-h-[80vh] w-full overflow-hidden hero-section-container flex flex-col justify-end">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
          style={{ backgroundImage: `url(${backdrop})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/20 to-transparent" />
        
        <div className="relative h-full flex flex-col justify-end px-6 pb-12 md:px-12 md:pb-24 max-w-5xl fade-in-up">
          <Breadcrumbs items={[
            { name: "الرئيسية", item: "/" },
            { name: "أفلام", item: "/movie" },
            { name: title, item: `/movie/${slug}` }
          ]} />
          
          {ai?.intro && (
            <p className="text-primary font-bold tracking-widest uppercase text-xs mb-4 opacity-80 backdrop-blur-sm bg-white/5 py-1 px-3 rounded-full w-fit">
              {ai.intro}
            </p>
          )}
          <h1 className="text-4xl md:text-8xl font-black font-heading mb-6 leading-[1.1] tracking-tighter hero-title">
            {title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm md:text-lg mb-8 font-medium text-muted">
            <span className="rating-badge">
              <span className="text-[10px] sm:text-xs">⭐</span>
              {rating}
            </span>
            <span className="bg-white/5 px-2 py-0.5 rounded border border-white/10">{year}</span>
            <span className="border border-primary/30 text-primary px-2 py-0.5 rounded text-xs font-bold">4K ULTRA HD</span>
            <span className="hidden sm:inline opacity-40">|</span>
            <span className="hidden sm:inline">{genres}</span>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <a 
              href={`https://tv.tomito.xyz/movie/${slug}`}
              className="btn-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              <span>مشاهدة الآن</span>
            </a>
            <button className="btn-secondary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              <span>تحميل</span>
            </button>
          </div>

          <div className="mt-16 p-8 md:p-10 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl max-w-3xl shadow-2xl">
             <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-5 bg-primary rounded-full shadow-[0_0_10px_var(--primary)]" />
                <h2 className="text-lg font-bold">قصة الفيلم</h2>
             </div>
             <p className="text-gray-300 text-lg leading-relaxed text-justify line-clamp-3 md:line-clamp-none">
                {overview}
             </p>
             {ai?.outro && (
                <p className="mt-4 text-primary/70 italic text-sm border-r border-primary/20 pr-4">
                  {ai.outro}
                </p>
             )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-6 md:px-12 pb-24 relative z-10 content-section-wrapper">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-16">
            
            {/* YouTube Trailer Section */}
            {trailer && (
              <section className="page-division">
                <div className="division-header">
                  <div className="line youtube" />
                  <h2>مقطع الدعائي (Trailer)</h2>
                  <span className="youtube-badge">YouTube</span>
                </div>
                <div className="video-container">
                  <iframe 
                    src={`https://www.youtube.com/embed/${trailer.key}?rel=0&showinfo=0&autoplay=0`}
                    title={`${title} Trailer`}
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="video-info">
                  <h3 className="video-title">{title} - Trailer Official</h3>
                  <div className="video-meta">
                    <span>{year}</span>
                    <span>•</span>
                    <span>{data.runtime ? `${data.runtime} min` : "Featured"}</span>
                  </div>
                </div>
              </section>
            )}

            {/* AI Opinion Section */}
            {ai?.opinion && (
              <section className="page-division">
                 <div className="division-header">
                    <div className="line" />
                    <h2>رأي توميتو</h2>
                 </div>
                 <div className="relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-3xl -z-10" />
                    <div className="bg-white/[0.03] p-10 rounded-3xl border border-white/[0.05] backdrop-blur-2xl">
                       <p className="text-white text-xl leading-relaxed font-bold italic">
                          "{ai.opinion}"
                       </p>
                    </div>
                 </div>
              </section>
            )}

            {/* FAQ Section */}
            {ai?.faq && ai.faq.length > 0 && (
              <section className="page-division">
                <div className="division-header">
                  <div className="line" />
                  <h2>الأسئلة الشائعة</h2>
                </div>
                <div className="space-y-4">
                  {ai.faq.map((item: any, idx: number) => (
                    <div key={idx} className="faq-item group">
                      <div className="faq-question">
                        {item.q || item.question}
                      </div>
                      <div className="faq-answer block">
                        {item.a || item.answer}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

             {/* Similar Movies */}
             {details?.similar?.results && (
             <section className="page-division">
                <div className="division-header">
                  <div className="line" />
                  <h2>أفلام مشابهة</h2>
                </div>
                <div className="netflix-row hide-scrollbar -mx-4 md:-mx-0">
                   {details.similar.results.slice(0, 10).map((item: any, i: number) => (
                      <div key={item.id} className="netflix-item" style={{ animationDelay: `${i * 50}ms` }}>
                        <a href={`/movie/${item.id}-${item.title?.toLowerCase().replace(/ /g, '-')}`} className="movie-card group">
                           <img 
                             src={`https://image.tmdb.org/t/p/w300${item.poster_path}`} 
                             alt={item.title} 
                             loading="lazy"
                           />
                           <div className="card-info">
                              <h3 className="text-xs font-bold text-white truncate">{item.title}</h3>
                           </div>
                        </a>
                      </div>
                   ))}
                </div>
             </section>
             )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white/[0.03] p-8 rounded-3xl border border-white/[0.05] backdrop-blur-3xl sticky top-24">
              <div className="relative group mb-8">
                <div className="absolute -inset-1 bg-gradient-to-b from-primary/30 to-transparent rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000" />
                <img src={poster} alt={title} className="relative w-full rounded-2xl shadow-well border border-white/10" />
              </div>
              
              <div className="space-y-6">
                 <div className="bg-white/[0.04] p-4 rounded-2xl border border-white/5">
                    <span className="text-muted block text-xs uppercase tracking-widest font-bold mb-2">التصنيفات</span>
                    <div className="flex flex-wrap gap-2">
                      {data.genres?.map((g: any) => (
                        <span key={g.id} className="bg-primary/10 text-primary-200 text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                          {g.name}
                        </span>
                      ))}
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/[0.04] p-4 rounded-2xl border border-white/5">
                       <span className="text-muted block text-xs font-bold uppercase mb-1">الإصدار</span>
                       <span className="text-white font-black">{year}</span>
                    </div>
                    <div className="bg-white/[0.04] p-4 rounded-2xl border border-white/5">
                       <span className="text-muted block text-xs font-bold uppercase mb-1">اللغة</span>
                       <span className="text-white font-black">العربية</span>
                    </div>
                 </div>

                 <div className="bg-primary p-5 rounded-2xl shadow-[0_10px_30px_rgba(255,100,0,0.2)] text-center">
                    <span className="text-white/80 block text-xs font-bold uppercase mb-1">تقييم توميتو</span>
                    <span className="text-white text-3xl font-black">{rating} <span className="text-sm opacity-60">/ 10</span></span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
