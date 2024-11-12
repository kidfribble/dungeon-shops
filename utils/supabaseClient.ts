import { useSession, useUser } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';
import { log } from 'console';

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// if (!supabaseUrl || !supabaseAnonKey) {
//   throw new Error("Missing Supabase URL or Anon Key");
// }

// export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const createClerkSupabaseClient = function() {
    const { session } = useSession()

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