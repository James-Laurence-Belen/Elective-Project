'use client'

import { ReactNode } from 'react'
import { BookmarkProvider } from '@/context/bookmarkcontext'
import { AuthProvider } from '@/context/authcontext'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <BookmarkProvider>{children}</BookmarkProvider>
    </AuthProvider>
  )
}
