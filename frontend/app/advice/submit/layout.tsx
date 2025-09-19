import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Share Your Advice - Find your Path",
  description: "Share your experiences and insights to help fellow Dartmouth students discover opportunities and navigate college life.",
}

export default function SubmitAdviceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
