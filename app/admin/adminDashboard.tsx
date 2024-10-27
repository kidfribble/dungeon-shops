"use client";
import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';

export default function AdminDashboard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [players, setPlayers] = useState<any[]>([]);
  
  
  useEffect(() => {
    if (isLoaded && isSignedIn && user?.publicMetadata?.isAdmin) {
      const fetchPlayers = async () => {
        let { data, error } = await supabase.from('players').select('*');
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