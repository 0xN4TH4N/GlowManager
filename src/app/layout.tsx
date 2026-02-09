import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientAuthWrapper from "@/components/ClientAuthWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "v0.0.1 - GlowManager",
  description: "AI Model Manager",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body className={inter.className}>
        {/* Le wrapper gère la logique client (auth, store, loader) */}
        <ClientAuthWrapper>
          {children}
        </ClientAuthWrapper>
      </body>
    </html>
  );
}