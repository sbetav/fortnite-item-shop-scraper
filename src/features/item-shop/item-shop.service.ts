import { BrowserService } from "../../shared/browser/browser.service";
import { CacheService } from "../cache/cache.service";
import { APP_CONFIG, API_ENDPOINTS } from "../../config/app.config";
import { ItemShopData, ItemData } from "./item-shop.types";

export class ItemShopService {
  private browserService: BrowserService;
  private cacheService: CacheService;

  constructor() {
    this.browserService = BrowserService.getInstance();
    this.cacheService = CacheService.getInstance();
  }

  /**
   * Common scraping function for Fortnite data
   */
  private async scrapeFortniteData(
    url: string,
    cacheType: "itemShop" | "jamTracks"
  ): Promise<any> {
    // Return cached data if valid
    const cachedData = this.cacheService.getCachedData(cacheType);
    if (cachedData) {
      return cachedData;
    }

    const context = await this.browserService.getContext();
    const page = await context.newPage();

    try {
      console.log(`Fetching fresh ${cacheType} data...`);

      // Direct API request - this is the most efficient approach
      const response = await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: APP_CONFIG.BROWSER_TIMEOUT,
      });

      const data = await response!.json();

      // Cache the successful response
      this.cacheService.setCacheData(cacheType, data);

      await page.close();
      return data;
    } catch (error) {
      await page.close();
      console.error(`Error scraping ${cacheType}:`, error);
      throw error;
    }
  }

  /**
   * Scrape item shop data
   */
  public async scrapeItemShop(): Promise<ItemShopData> {
    return await this.scrapeFortniteData(API_ENDPOINTS.ITEM_SHOP, "itemShop");
  }

  /**
   * Scrape individual item data
   */
  public async scrapeItem(
    assetType: string,
    itemId: string
  ): Promise<ItemData> {
    // For bundles, use hardcoded "bundles" in the _data parameter
    // For other asset types, use %24assetType (which is $assetType)
    const dataParam =
      assetType === "bundles"
        ? `routes%2Fitem-shop.bundles.%24bundleName`
        : `routes%2Fitem-shop.%24assetType.%24assetName`;

    const url = `https://www.fortnite.com/item-shop/${assetType}/${itemId}?lang=en-US&_data=${dataParam}`;

    const context = await this.browserService.getContext();
    const page = await context.newPage();

    try {
      console.log(`Fetching fresh item data for ${assetType}/${itemId}...`);

      // Direct API request
      const response = await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: APP_CONFIG.BROWSER_TIMEOUT,
      });

      const data = await response!.json();

      await page.close();
      return data;
    } catch (error) {
      await page.close();
      console.error(`Error scraping item ${assetType}/${itemId}:`, error);
      throw error;
    }
  }
}
