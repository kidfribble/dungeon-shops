import { createClient } from '@supabase/supabase-js';
import { useSession } from '@clerk/nextjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase URL or Anon Key");
}

export const createClerkSupabaseClient = (session: any) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      fetch: async (url, options = {}) => {
        const token = await session?.getToken({ template: 'supabase' });

        if (token) {
          options.headers = {
            ...options.headers,
            Authorization: `Bearer ${token}`,
          };
        }

        return fetch(url, options);
      },
    },
  });
};

// Export a custom hook to use the Supabase client
export function useSupabaseClient() {
  const { session } = useSession();
  if (!session) {
    throw new Error('User session is not available');
  }

  return createClerkSupabaseClient(session);
}
