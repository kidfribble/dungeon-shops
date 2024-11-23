'use client';

import { useEffect, useState } from 'react';
import { createClerkSupabaseClient } from '@/utils/supabaseClient';

import { Button } from '@/components/ui/button';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarMenuItem } from '@/components/ui/sidebar';
import { Table, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { useSession, useUser } from '@clerk/nextjs'
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
  id: number;
};

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedShopkeeper, setSelectedShopkeeper] = useState<string | null>(null);
  const [shopkeepers, setShopkeepers] = useState<Shopkeeper[]>([]);
  const [inventory, setInventory] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);

  const [transaction, makeTransact] = useState<Transaction[]>([]);
  const [player, setPlayer] = useState<CurrentPlayer[]>([]);

  const client = createClerkSupabaseClient()

  const { user } = useUser()

  const { isLoaded, userId, sessionId, getToken } = useAuth()

  // In case the user signs out while on the page.
  if (!isLoaded || !userId) {
    return null
  }

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

  // This `useEffect` will wait for the `user` object to be loaded before requesting
  // the tasks for the logged in user
  useEffect(() => {
      if (!user) return

      async function loadPlayer() {  
      setLoading(true)

      const id = "{userId}"
      
      

      // Rewrite to update the CurrentPlayer interface with the clerkid
      // and to use for sewing up inventory and handling currency exchanges (perhaps)
      // may need to draw this out


      // try {
      //   const { data, error } = await client
      //     .from('items')
      //     .select('*')
      //     .eq('shopkeeper_id', selectedShopkeeper);

      //   if (error) throw error;
      //   setPlayer(data as CurrentPlayer[]);

      // } catch (error) {
      //   console.error(error);

      // } finally {
      //   setLoading(false);

      // }

      loadPlayer();
    }
  }, [user])

  useEffect(() => {
    if (player) {
      const fetchPlayerInventory = async () => {
        setLoading(true);

        try {
          const { data, error } = await client
            .from('player_inventories')
            .select('*')
            .eq('inventory', player);
          
            console.log(data)

          if (error) throw error;
          console.log(data)

        } catch (error) {
          console.error(error);

        } finally {
          setLoading(false);

        }
      };
      fetchPlayerInventory();
    }
  }, [player]);

 
  const currencyExchange = (number: number) => {
    // get this button working
    console.log(number);

    // use makeTransact to send the credit and debits record to the database
    // update Transaction with debits and credits
    // exchange items between inventories

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
      <div className="flex-grow p-8">
        {/* Show shopkeeper name clearly, shopkeeper coin, and player coin */}
        <h1>{selectedShopkeeper}</h1>
        {loading ? (
          <div>Loading...</div>
        ) : (
          selectedShopkeeper && (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Welcome, {userId}</TableCell>
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
