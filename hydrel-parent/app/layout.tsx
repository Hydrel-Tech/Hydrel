import type { Metadata } from 'next'
import { Inter } from "next/font/google";
import './globals.css'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: 'Hydrel Systems Portfolio',
  description: 'Advanced solutions for modern infrastructure',
  viewport: "width=device-width, initial-scale=1.0"
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen flex flex-col bg-[#f6f9fc] text-[#424770] overflow-x-hidden">
        <Navbar scrolled={false} />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
};
