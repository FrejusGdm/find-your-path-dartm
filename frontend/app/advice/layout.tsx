import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Wall of Advice - Find your Path",
  description: "Real experiences and insights from Dartmouth students to help you discover opportunities and navigate college life.",
}

export default function AdviceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
