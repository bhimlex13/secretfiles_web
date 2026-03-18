import { Inter } from "next/font/google";
import "./globals.css";
import NavigationLayout from "../components/NavigationLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Veil",
  description: "Share your hidden truths and paranormal encounters.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NavigationLayout>
          {children}
        </NavigationLayout>
      </body>
    </html>
  );
}