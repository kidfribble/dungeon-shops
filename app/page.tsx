'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
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

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [inventory, setInventory] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (selectedLocation) {
      setLoading(true);
      const fetchInventory = async () => {
        try {
          let { data, error } = await supabase
            .from('items')
            .select(`
              *,
              shopkeepers (
                location
              )
            `)
            .eq('shopkeepers.location', selectedLocation);
          
          if (error) throw error;
      
          if (data) {
            setInventory(data as Item[]);
          }
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };      

      fetchInventory();
    }
  }, [selectedLocation]);

  return (
    <div className="flex">
      <Sidebar className="w-1/4 h-screen bg-gray-800 p-4 text-white">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Shop Locations</SidebarGroupLabel>
            <SidebarMenuItem onClick={() => setSelectedLocation('Temple District')}>Temple District</SidebarMenuItem>
            <SidebarMenuItem onClick={() => setSelectedLocation('Festival Grounds')}>Festival Grounds</SidebarMenuItem>
            <SidebarMenuItem onClick={() => setSelectedLocation('Library')}>Library</SidebarMenuItem>
            <SidebarMenuItem onClick={() => setSelectedLocation('Dockside')}>Dockside</SidebarMenuItem>
            <SidebarMenuItem onClick={() => setSelectedLocation('Downtown')}>Downtown</SidebarMenuItem>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <div className="flex-grow p-8">
        {loading ? (
          <div>Loading Inventory...</div>
        ) : (
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
              {inventory.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.item_name}</TableCell>
                  <TableCell>{item.price}</TableCell>
                  <TableCell>{item.weight}</TableCell>
                  <TableCell>{item.properties}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
