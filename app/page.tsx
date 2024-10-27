'use client';

import { useEffect, useState } from 'react';
import { useSupabaseClient } from '@/utils/supabaseClient';

const client = useSupabaseClient();

import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarMenuItem } from '@/components/ui/sidebar';
import { Table, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';

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

interface Shopkeeper {
  id: string;
  name: string;
  location: string;
  currency: number;
}

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedShopkeeper, setSelectedShopkeeper] = useState<string | null>(null);
  const [shopkeepers, setShopkeepers] = useState<Shopkeeper[]>([]);
  const [inventory, setInventory] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);

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
        {loading ? (
          <div>Loading...</div>
        ) : (
          selectedShopkeeper && (
            <Table>
              <TableHead>
                <TableRow>
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
                    <TableCell>{item.price}</TableCell>
                    <TableCell>{item.weight}</TableCell>
                    <TableCell>{item.properties}</TableCell>
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
