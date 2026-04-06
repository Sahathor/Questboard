import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Toaster } from "sonner";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Questboard",
  description: "Gamifizierte Productivity – verwandle dein Leben in ein RPG.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className="dark">
      <body
        className={`${geist.variable} ${geistMono.variable} font-sans antialiased bg-zinc-950 text-zinc-100 min-h-screen`}
      >
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 ml-64 p-8 max-w-5xl">
            {children}
          </main>
        </div>
        <Toaster // neu
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "hsl(240 8% 7%)",
              border: "1px solid hsl(240 6% 14%)",
              color: "hsl(240 5% 90%)",
            },
          }}
        />
      </body>
    </html>
  );
}