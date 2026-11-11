import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'TIA-DAS — CONNECT-DAET.ph',
  description:
    'Tourism Impact Assessment and Data Analytics System — Municipal Tourism Office of Daet, Camarines Norte',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link
          rel="stylesheet"
          href="/(subsystems)/analytics/analytics-print.css"
          media="print"
        />
      </head>
      <body className="min-h-full bg-gray-50">
        {children}
      </body>
    </html>
  )
}
