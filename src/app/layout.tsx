// src/app/layout.tsx
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Secret Files",
  description: "Share and discover anonymous stories safely.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 min-h-screen text-slate-900`}>
        <Navbar />
        <main className="container mx-auto px-4 md:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}