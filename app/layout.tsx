'use client';

import "./globals.css";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  SignOutButton,
  UserButton
} from '@clerk/nextjs'

export default function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>            
            <SidebarProvider>
              <AppSidebar />
              <main>
                <SidebarTrigger />
                {children}
              </main>
            </SidebarProvider>
            <UserButton />
            <SignOutButton />
          </SignedIn>
        </body>
      </html>
    </ClerkProvider>
  )
}