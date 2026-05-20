import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="ar" dir="rtl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body>
        <header className="glass fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-6 md:px-12">
          <div className="flex items-center justify-between w-full gap-4">
            <div className="flex items-center gap-8">
              <a href="/" className="text-red-primary text-3xl font-bold tracking-tighter font-heading">
                TOMITO
              </a>
              <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
                <a href="/" className="hover:text-red-primary transition-colors">الرئيسية</a>
                <a href="#movies" className="hover:text-red-primary transition-colors">أفلام</a>
                <a href="#series" className="hover:text-red-primary transition-colors">مسلسلات</a>
                <a href="/genre/animation" className="hover:text-red-primary transition-colors">أنمي</a>
              </nav>
            </div>
            <div className="flex-1 max-w-sm">
                <Search />
            </div>
          </div>
        </header>
        <main className="pt-16 min-h-screen">
          {children}
        </main>
        <footer className="py-12 px-6 border-t border-white/10 text-center text-gray-400 text-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="text-red-primary text-2xl font-bold font-heading">TOMITO</div>
            <p>© 2026 جميع الحقوق محفوظة | مشاهدة افلام ومسلسلات اون لاين</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
