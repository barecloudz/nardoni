import type { Metadata } from 'next'
import { Suspense } from 'react'
import BookACallContent from '../../../src/page-content/book-a-call'

export const metadata: Metadata = {
  title: 'Book a Free Strategy Call | Nardoni Digital',
  description: "Schedule a free 30-minute strategy call. We'll show you exactly how to get on page 1 of Google and grow your local business.",
  openGraph: {
    title: 'Book a Free Strategy Call | Nardoni Digital',
    description: "Schedule a free 30-minute strategy call. We'll show you exactly how to get on page 1 of Google.",
  },
  alternates: {
    canonical: 'https://nardonidigital.com/book-a-call',
  },
}

export default function BookACallPage() {
  return (
    <Suspense>
      <BookACallContent />
    </Suspense>
  )
}
