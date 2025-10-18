export interface CacheData {
  data: any | null;
  timestamp: number | null;
}

export interface CacheStore {
  itemShop: CacheData;
  jamTracks: CacheData;
}

export type CacheType = "itemShop" | "jamTracks" | "all";
