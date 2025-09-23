export interface ShoppingItem {
  id: string;
  name: string;
  bought: boolean;
  timestamp: number;
  lastModifiedBy: string;  // Anonymous user ID who last modified the item
  lastModifiedAt: number;  // Timestamp of the last modification
}
