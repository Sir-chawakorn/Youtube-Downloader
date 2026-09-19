import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Local YouTube Downloader - Fast & Safe Media Downloader",
  description: "Download high quality YouTube videos and audios directly to your computer with yt-dlp & FFmpeg. 100% Local & Private.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className="h-full">
      <body className="min-h-full flex flex-col bg-[#0b0f19] text-slate-100 antialiased selection:bg-red-500 selection:text-white">
        <Navbar />
        <main className="flex-1 pb-16">
          {children}
        </main>
        <footer className="py-6 border-t border-white/5 text-center text-xs text-slate-500">
          <p>© 2026 Local YouTube Downloader • Powered by yt-dlp & FFmpeg • 100% Local & Private</p>
        </footer>
      </body>
    </html>
  );
}
