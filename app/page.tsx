'use client';

import { useEffect, useState, useRef } from 'react';
import { getClerkSupabaseClient } from '@/utils/supabaseClient';
import { convertClerkIdToUUID } from '@/utils/convertClerkId';
import { Button } from '@/components/ui/button';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarMenuItem } from '@/components/ui/sidebar';
import { Table, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { useUser, useAuth, useSession } from '@clerk/nextjs';
import { UUID } from 'crypto';

interface Item {
  id: string;
  item_name: string;
  price: string;
  ac: string;
  damage: string;
  weight: string;
  type: string;
  properties: string;
}

interface Transaction {
  id: string;
  name: string;
  location: string;
  credit: number;
  debit: number;
  items: [];
}

interface Shopkeeper {
  id: string;
  name: string;
  location: string;
  currency: number;
  status: boolean;
}

interface CurrentPlayer {
  id: string;
  username: string;
  currency: number;
  user_id: UUID;
}

interface PlayerInventory {
  item_id: string;
  quantity: number;
}

export default function Home() {
  const { session } = useSession();
  const { user } = useUser();
  const { isLoaded, userId: clerkId } = useAuth();

  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedShopkeeper, setSelectedShopkeeper] = useState<string | null>(null);
  const [shopkeepers, setShopkeepers] = useState<Shopkeeper[]>([]);
  const [inventory, setInventory] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [transaction, makeTransact] = useState<Transaction[]>([]);
  const [player, setPlayer] = useState<CurrentPlayer | null>(null);
  const [playerInventory, setPlayerInventory] = useState<PlayerInventory[]>([]);

  const hasFetchedPlayer = useRef(false);

  let client = null;

  if (isLoaded && session) {
    client = getClerkSupabaseClient();
  }

  useEffect(() => {
    if (!client || !clerkId || hasFetchedPlayer.current) return;

    const clerkIdUUID = convertClerkIdToUUID(clerkId);
    console.log('Converted Clerk UUID:', clerkIdUUID);

    const fetchOrCreatePlayer = async () => {
      try {
        // Fetch existing player
        const { data: existingPlayer, error: fetchError } = await client
          .from('players')
          .select('*')
          .eq('user_id', clerkIdUUID)
          .single();

        if (fetchError) {
          console.error('Error fetching player:', fetchError.message);
        } else {
          console.log('Existing Player:', existingPlayer);
        }

        if (existingPlayer) {
          setPlayer({
            id: existingPlayer.id,
            username: existingPlayer.username,
            currency: existingPlayer.currency,
            user_id: existingPlayer.clerkIdUUID,
          });

          fetchPlayerInventory(existingPlayer.id);
        } else {
          console.log('No existing player found. Creating new player.');

          const { data: newPlayer, error: insertError } = await client
            .from('players')
            .insert({
              user_id: clerkIdUUID,
              username: 'New player',
              currency: 1000,
            })
            .select()
            .single();

          if (insertError) {
            console.error('Error creating player:', insertError.message);
            return;
          }

          console.log('New Player Created:', newPlayer);

          if (newPlayer) {
            setPlayer({
              id: newPlayer.id,
              username: newPlayer.username,
              currency: newPlayer.currency,
              user_id: newPlayer.clerkIdUUID,
            });

            fetchPlayerInventory(newPlayer.id);
          }
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      }
    };

    const fetchPlayerInventory = async (playerId: string) => {
      if (!client) {
        console.error('Supabase client is not initialized.');
        return;
      }

      try {
        const { data, error } = await client
          .from('player_inventories')
          .select('*')
          .eq('player_id', playerId);

        if (error) throw error;

        setPlayerInventory(data || []);
      } catch (error) {
        console.error('Error fetching player inventory:', error);
      }
    };

    hasFetchedPlayer.current = true;

    fetchOrCreatePlayer();
  }, [client, clerkId]);

  useEffect(() => {
    if (client && selectedLocation) {
      const fetchShopkeepers = async () => {
        setLoading(true);
        try {
          const { data, error } = await client
            .from('shopkeepers')
            .select('*')
            .eq('location', selectedLocation);

          if (error) throw error;
          setShopkeepers(data || []);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      fetchShopkeepers();
    }
  }, [client, selectedLocation]);

  useEffect(() => {
    if (client && selectedShopkeeper) {
      const fetchInventory = async () => {
        setLoading(true);
        try {
          const { data, error } = await client
            .from('items')
            .select('*')
            .eq('shopkeeper_id', selectedShopkeeper);

          if (error) throw error;
          setInventory(data || []);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      fetchInventory();
    }
  }, [client, selectedShopkeeper]);

  const currencyExchange = (item: Item) => {
    if (!player || !client) {
      console.error('Player or Supabase client not found');
      return;
    }

    console.log('Attempting to buy item:', item);

    // Update the player's inventory in player_inventories table
    const addItemToPlayerInventory = async () => {
      try {
        const { data, error } = await client
          .from('player_inventories')
          .insert({
            player_id: player.id,
            item_id: item.id,
            quantity: 1,
          });

        if (error) throw error;

        console.log('Item added to inventory:', data);
        setPlayerInventory([...playerInventory, { item_id: item.id, quantity: 1 }]);

        // Deduct item price from player currency
        setPlayer((prev) => {
          if (prev) {
            return { ...prev, currency: prev.currency - parseInt(item.price) };
          }
          return prev;
        });
      } catch (error) {
        console.error('Error adding item to player inventory:', error);
      }
    };

    addItemToPlayerInventory();
  };

  return (
    <div className="flex">
      <Sidebar className="w-1/4 h-screen bg-gray-800 p-4 text-white">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Shop Locations</SidebarGroupLabel>
            <SidebarMenuItem onClick={() => setSelectedLocation('Temple District')}>Temple District</SidebarMenuItem>
            <SidebarMenuItem onClick={() => setSelectedLocation('Festival Grounds')}>Festival Grounds</SidebarMenuItem>
            <SidebarMenuItem onClick={() => setSelectedLocation('Downtown')}>Downtown</SidebarMenuItem>
            <SidebarMenuItem onClick={() => setSelectedLocation('Dockside')}>Dockside</SidebarMenuItem>
            <SidebarMenuItem onClick={() => setSelectedLocation('Library')}>Library</SidebarMenuItem>
          </SidebarGroup>
          {selectedLocation && (
            <SidebarGroup>
              <SidebarGroupLabel>Shopkeepers</SidebarGroupLabel>
              {shopkeepers.map((shopkeeper) => (
                <SidebarMenuItem key={shopkeeper.id} onClick={() => setSelectedShopkeeper(shopkeeper.id)}>
                  {shopkeeper.name}
                </SidebarMenuItem>
              ))}
            </SidebarGroup>
          )}
        </SidebarContent>
      </Sidebar>
      <div className='player-information p-4'>
        {player && (
          <div>
            <p>Player ID: {player.id}</p>
            <p>Player ClerkID: {player.user_id}</p>
            <h2>Username: {player.username}</h2>
            <p>Currency: {player.currency}</p>
            <h3>Inventory:</h3>
            <ul>
              {playerInventory.map((invItem) => (
                <li key={invItem.item_id}>
                  Item ID: {invItem.item_id}, Quantity: {invItem.quantity}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="flex-grow p-8">
        <h1>{selectedShopkeeper}'s Excellent Shop</h1>
        {loading ? (
          <div>Loading...</div>
        ) : (
          selectedShopkeeper && (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Welcome</TableCell>
                  <TableCell>Item Name</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Weight</TableCell>
                  <TableCell>Properties</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.item_name}</TableCell>
                    <TableCell>{item.weight}</TableCell>
                    <TableCell>{item.properties}</TableCell>
                    <TableCell>
                      <Button onClick={() => currencyExchange(item)}>
                        {item.price}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )
        )}
      </div> 
    </div>
  );
}
