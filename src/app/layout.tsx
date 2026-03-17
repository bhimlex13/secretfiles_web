import { Inter } from "next/font/google";
import "./globals.css";
import NavigationLayout from "../components/NavigationLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Dear Stranger",
  description: "A safe space to share your thoughts and read others.",
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