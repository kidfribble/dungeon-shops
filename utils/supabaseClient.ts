'use client';

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../lib/database.types';
import { useSession } from '@clerk/nextjs';
import { useEffect, useState, useMemo } from 'react';

let supabaseClient: SupabaseClient<Database> | undefined;

export const getClerkSupabaseClient = (): SupabaseClient<Database> | undefined => {
  const { session } = useSession();

  if (!session) {
    console.error('No session found. Supabase client cannot be initialized.');
    return undefined;
  }

  if (!supabaseClient) {
    supabaseClient = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          fetch: async (url, options = {}) => {
            console.log('Supabase request URL:', url); // Log request URLs
            options = options || {};
            const clerkToken = await session?.getToken({ template: 'supabase' });

            if (!clerkToken) {
              console.error('Failed to retrieve Clerk token.');
              return new Response(
                JSON.stringify({ error: 'No Clerk token available' }),
                { status: 401 }
              );
            } else {
              console.log('Clerk token:', clerkToken);
            }

            options.headers = {
              ...options.headers,
              Authorization: `Bearer ${clerkToken}`,
              'Content-Type': 'application/json',
              apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            };
            return fetch(url, options);
          },
        },
      }
    );
  }

  return supabaseClient;
};

export const useClerkSupabaseClient = (): SupabaseClient<Database> | undefined => {
  const { session } = useSession();
  const [supabase, setSupabase] = useState<SupabaseClient<Database> | undefined>(supabaseClient);

  useEffect(() => {
    if (!session) {
      console.error('No session available for Supabase client.');
      setSupabase(undefined);
    } else if (!supabaseClient) {
      console.log('Initializing Supabase client.');
      setSupabase(getClerkSupabaseClient());
    } else {
      console.log('Using existing Supabase client.');
      setSupabase(supabaseClient);
    }
  }, [session]);

  return supabase;
};
