import type { Metadata } from "next";
import { Inter, Outfit, Tajawal } from "next/font/google";
import "./globals.css";

const interStatic = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfitStatic = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const tajawalStatic = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TOMITO — مشاهدة أفلام ومسلسلات أون لاين",
  description: "أفضل موقع لمشاهدة وتحميل الأفلام والمسلسلات الحصرية بجودة عالية وبدون إعلانات.",
};

import Search from "@/components/Search";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${interStatic.variable} ${outfitStatic.variable} ${tajawalStatic.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#080c1a" />
      </head>
      <body>
        {/* ───── NAVBAR ───── */}
        <header className="navbar">
          <div className="flex items-center justify-between w-full gap-3">
            <div className="flex items-center gap-3 md:gap-8">
              <a href="/" className="flex items-center gap-1.5">
                <span className="text-primary text-xl md:text-2xl font-black tracking-[-0.06em]" style={{ fontFamily: 'var(--font-outfit)' }}>
                  TOMITO
                </span>
              </a>
              <nav className="hidden md:flex items-center gap-5 text-[13px] font-semibold">
                <a href="/" className="text-white hover:text-primary transition-colors">الرئيسية</a>
                <a href="/movie" className="text-white/50 hover:text-white transition-colors">أفلام</a>
                <a href="/tv" className="text-white/50 hover:text-white transition-colors">مسلسلات</a>
              </nav>
            </div>
            <div className="flex-1 max-w-[160px] md:max-w-xs">
              <Search />
            </div>
          </div>
        </header>

        {/* ───── MAIN ───── */}
        <main className="min-h-screen">
          {children}
        </main>

        {/* ───── FOOTER ───── */}
        <footer className="premium-footer">
          <div className="footer-logo" style={{ fontFamily: 'var(--font-outfit)' }}>TOMITO</div>
          <p>© 2026 جميع الحقوق محفوظة — أفلام ومسلسلات بجودة عالية</p>
        </footer>
      </body>
    </html>
  );
}
