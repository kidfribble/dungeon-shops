import { v5 as uuidv5 } from 'uuid';

const NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

export function convertClerkIdToUUID(clerkId: string): string {
  return uuidv5(clerkId, NAMESPACE);
}
