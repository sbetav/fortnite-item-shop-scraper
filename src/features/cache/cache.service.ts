import { CacheStore, CacheType } from "./cache.types";
import { APP_CONFIG } from "../../config/app.config";

export class CacheService {
  private static instance: CacheService;
  private cache: CacheStore = {
    itemShop: {
      data: null,
      timestamp: null,
    },
    jamTracks: {
      data: null,
      timestamp: null,
    },
  };

  private constructor() {}

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * Check cache validity based on 30-minute expiration
   */
  public isCacheValid(cacheType: CacheType = "itemShop"): boolean {
    if (cacheType === "all") {
      return this.isCacheValid("itemShop") || this.isCacheValid("jamTracks");
    }

    const cacheData = this.cache[cacheType];
    if (!cacheData.data || !cacheData.timestamp) {
      return false;
    }

    const cacheTime = new Date(cacheData.timestamp);
    const now = new Date();
    const expirationTime = new Date(
      now.getTime() - APP_CONFIG.CACHE_DURATION_MS
    );

    // Cache is valid if it was created within the last 30 minutes
    return cacheTime > expirationTime;
  }

  /**
   * Get cached data if valid
   */
  public getCachedData(cacheType: CacheType): any | null {
    if (cacheType === "all") {
      return null; // Don't return cached data for 'all' type
    }
    if (this.isCacheValid(cacheType)) {
      console.log(`Returning cached ${cacheType} data`);
      return this.cache[cacheType].data;
    }
    return null;
  }

  /**
   * Set cache data
   */
  public setCacheData(cacheType: CacheType, data: any): void {
    if (cacheType === "all") {
      this.cache.itemShop.data = data;
      this.cache.itemShop.timestamp = Date.now();
      this.cache.jamTracks.data = data;
      this.cache.jamTracks.timestamp = Date.now();
    } else {
      this.cache[cacheType].data = data;
      this.cache[cacheType].timestamp = Date.now();
    }
  }

  /**
   * Clear cache
   */
  public clearCache(cacheType: CacheType): void {
    if (cacheType === "all" || !cacheType) {
      this.cache.itemShop.data = null;
      this.cache.itemShop.timestamp = null;
      this.cache.jamTracks.data = null;
      this.cache.jamTracks.timestamp = null;
    } else {
      this.cache[cacheType].data = null;
      this.cache[cacheType].timestamp = null;
    }
  }

  /**
   * Get cache status
   */
  public getCacheStatus() {
    return {
      itemShop: {
        hasData: !!this.cache.itemShop.data,
        timestamp: this.cache.itemShop.timestamp,
        isValid: this.isCacheValid("itemShop"),
      },
      jamTracks: {
        hasData: !!this.cache.jamTracks.data,
        timestamp: this.cache.jamTracks.timestamp,
        isValid: this.isCacheValid("jamTracks"),
      },
    };
  }
}
