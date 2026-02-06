import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Hydrel Systems Portfolio',
  description: 'Advanced solutions for modern infrastructure',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Navbar scrolled={false} />
        
        <main className="flex-grow">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  )
}
