"use client";

import localFont from "next/font/local";
import "./globals.css";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

import { useEffect, useState } from 'react';
import { useSession, useUser } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';

import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs'

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

interface Shopkeeper {
  id: number; // Update this to match your actual data structure
  name: string; // Update this to match your actual data structure
  // Add other fields as necessary
}

export default function RootLayout({ children }: { children: React.ReactNode }) {

  const [shopData, setShopData] = useState<Shopkeeper[]>([]);
  const [loading, setLoading] = useState(true);
  const { session } = useSession();
  

  function createClerkSupabaseClient() {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          fetch: async (url, options = {}) => {
            const clerkToken = await session?.getToken({
              template: 'supabase',
            })

              const headers = new Headers(options?.headers)
            headers.set('Authorization', `Bearer ${clerkToken}`)

            return fetch(url, {
              ...options,
              headers,
            })
          }
        }
      }
    )
  }

  const client = createClerkSupabaseClient()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let { data, error } = await client.from('shopkeepers').select('*');
        if (error) throw error;
        setShopData(data || []); // Ensures shopData is always an array
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  

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
                <UserStatus loading={loading} shopData={shopData} />
              </main>
            </SidebarProvider>
            <UserButton />
          </SignedIn>
        </body>
      </html>
    </ClerkProvider>
  )
}

function UserStatus({ loading, shopData }: { loading: boolean; shopData: Shopkeeper[] }) {
  const { isLoaded } = useUser();

  if (!isLoaded) {
    return <div>Loading user...</div>;
  }

  return (
      <main>
        {loading ? <div>Loading...</div> : shopData.map(shopkeeper => (
          <div key={shopkeeper.id}>{shopkeeper.name}</div>
        ))}
      </main>
  );
}