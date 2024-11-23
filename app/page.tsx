'use client';

import { useEffect, useState } from 'react';
import { createClerkSupabaseClient } from '@/utils/supabaseClient';

import { Button } from '@/components/ui/button';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarMenuItem } from '@/components/ui/sidebar';
import { Table, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { useUser } from '@clerk/nextjs'
import { useAuth } from '@clerk/nextjs'

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

// Creating player inventories
interface CurrentPlayer {
  id: string;
  username: string;
  currency: number;
  inventory: [];
  user_id: string;
};

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedShopkeeper, setSelectedShopkeeper] = useState<string | null>(null);
  const [shopkeepers, setShopkeepers] = useState<Shopkeeper[]>([]);
  const [inventory, setInventory] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);

  const [transaction, makeTransact] = useState<Transaction[]>([]);

  const client = createClerkSupabaseClient();

  const { user } = useUser();

  const { isLoaded, userId: clarkId, sessionId, getToken } = useAuth();
  const [player, setPlayer] = useState<CurrentPlayer[]>([]);

  useEffect(() => {
    let isFetching = false;

    const fetchOrCreatePlayer = async () => {
      if (isFetching) return;
      isFetching = true;

      if(!clarkId) return;

      const { data: existingPlayer, error: fetchError } = await client  
        .from('players')
        .select('*')
        .eq('user_id', clarkId)
        .single();
      
      console.log('clark id: '+ clarkId);
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching player:', fetchError.message);
        return;
      }

      if (existingPlayer) {
        setPlayer([{
          id: existingPlayer.id,
          username: existingPlayer.username,
          currency: existingPlayer.currency,
          inventory: [],
          user_id: clarkId,
        }]);
        return;
      }

      const { data: newPlayer, error: insertError } = await client
        .from('players')
        .insert({
          user_id: clarkId,
          username: 'New player',
          currency: 1000,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating player:', insertError.message)
        return;
      }

      setPlayer([{
        id: newPlayer.id,
        username: newPlayer.username,
        currency: newPlayer.currency,
        inventory: [],
        user_id: clarkId,
      }]);

    }

    fetchOrCreatePlayer();
  }, [clarkId])

  useEffect(() => {
    if (selectedLocation) {
      const fetchShopkeepers = async () => {
        setLoading(true);

        try {
          const { data, error } = await client
            .from('shopkeepers')
            .select('*')
            .eq('location', selectedLocation);

          if (error) throw error;
          setShopkeepers(data as Shopkeeper[]);

        } catch (error) {
          console.error(error);

        } finally {
          setLoading(false);

        }
      };
      fetchShopkeepers();
    }
  }, [selectedLocation]);

  useEffect(() => {
    if (selectedShopkeeper) {
      const fetchInventory = async () => {
        setLoading(true);

        try {
          const { data, error } = await client
            .from('items')
            .select('*')
            .eq('shopkeeper_id', selectedShopkeeper);
            
            // will need to select shopkeeper name from here, pass it in for the heading

          if (error) throw error;
          setInventory(data as Item[]);

        } catch (error) {
          console.error(error);

        } finally {
          setLoading(false);

        }
      };
      fetchInventory();
    }
  }, [selectedShopkeeper]);

  const currencyExchange = (number: number) => {
    // get this button working
    console.log(number);

    // use makeTransact to send the credit and debits record to the database
    // update Transaction with debits and credits
    // exchange items between inventories
    // reference below

    // interface Transaction {
    //   id: string;
    //   name: string;
    //   location: string;
    //   credit: number;
    //   debit: number;
    //   items: [];
    // }
    
    // const [transaction, makeTransact] = useState<Transaction[]>([]);

  }

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
      <div className='player-information'>
        {player.map((p) => (
          <div>
            <p>Player ID: {p.id}</p>
            <p>Username: {p.username}</p>
            <p>Currency: {p.currency}</p>
            <p>Inventory: {p.inventory.join('. ')}</p>
          </div>
        ))}
        <h2></h2>
      </div>
      <div className="flex-grow p-8">
        {/* Show shopkeeper name clearly, shopkeeper coin, and player coin */}
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
                      <Button onClick={() => currencyExchange(parseInt(item.price))}>
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
