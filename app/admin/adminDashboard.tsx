'use client';

import { useSession, useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function AdminDashboard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [players, setPlayers] = useState<any[]>([]);
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
    if (isLoaded && isSignedIn && user?.publicMetadata?.isAdmin) {
      const fetchPlayers = async () => {
        let { data, error } = await client.from('players').select('*');
        if (!error) setPlayers(data ?? []);
      };
      fetchPlayers();
    }
  }, [isLoaded, isSignedIn, user]);
  
  if (!user?.publicMetadata?.isAdmin) {
    return <div>Access Denied</div>;
  }
  
  return (
    <div>
      <h1>Admin Dashboard</h1>
      {players.map(player => (
        <div key={player.id}>{player.username} - Gold: {player.currency}</div>
      ))}
    </div>
  );
}