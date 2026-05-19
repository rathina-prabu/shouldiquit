import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Should I Quit?",
  description: "An app that asks 19 questions and answers one. Anonymous.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
