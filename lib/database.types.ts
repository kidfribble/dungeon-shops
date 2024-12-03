import { UUID } from "crypto";

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
    public: {
      Tables: {
        players: {
          Row: {
            id: string;
            username: string;
            currency: number;
            inventory: string[]; // Assuming inventory is an array of UUIDs now
            user_id: UUID; // Update this type to UUID (if needed)
          };
          Insert: {
            id?: string;
            username: string;
            currency: number;
            inventory?: string[]; // Updated type
            user_id: UUID; // Update this type to UUID (if needed)
          };
          Update: {
            id?: string;
            username?: string;
            currency?: number;
            inventory?: string[]; // Updated type
            user_id?: UUID; // Update this type to UUID (if needed)
          };
        };
      };
    };
  }
  
