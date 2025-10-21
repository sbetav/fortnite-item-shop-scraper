import { BrowserService } from "../../shared/browser/browser.service";
import { APP_CONFIG, API_ENDPOINTS } from "../../config/app.config";
import {
  ItemShopData,
  ItemData,
  SupportedLanguage,
  DEFAULT_LANGUAGE,
} from "./item-shop.types";

export class ItemShopService {
  private browserService: BrowserService;

  constructor() {
    this.browserService = BrowserService.getInstance();
  }

  /**
   * Common scraping function for Fortnite data
   */
  private async scrapeFortniteData(url: string): Promise<any> {
    const context = await this.browserService.getContext();
    const page = await context.newPage();

    try {
      console.log(`Fetching fresh data...`);

      // Direct API request - this is the most efficient approach
      const response = await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: APP_CONFIG.BROWSER_TIMEOUT,
      });

      const data = await response!.json();

      await page.close();
      return data;
    } catch (error) {
      await page.close();
      console.error(`Error scraping data:`, error);
      throw error;
    }
  }

  /**
   * Scrape item shop data
   */
  public async scrapeItemShop(
    lang: SupportedLanguage = DEFAULT_LANGUAGE
  ): Promise<ItemShopData> {
    return await this.scrapeFortniteData(API_ENDPOINTS.ITEM_SHOP(lang));
  }

  /**
   * Scrape individual item data
   */
  public async scrapeItem(
    assetType: string,
    itemId: string,
    lang: SupportedLanguage = DEFAULT_LANGUAGE
  ): Promise<ItemData> {
    let url: string;
    let dataParam: string;

    // Handle special case for bundles (uses %24bundleName instead of %24assetName)
    if (assetType === "bundles") {
      dataParam = `routes%2Fitem-shop.bundles.%24bundleName`;
    } else if (assetType === "jamtrack" || assetType === "jam-tracks") {
      // For jam tracks, use the jam-tracks path with the correct _data parameter
      dataParam = `routes%2Fitem-shop.jam-tracks.%24assetName`;
      assetType = "jam-tracks"; // Normalize to jam-tracks for URL
    } else {
      // For other asset types, use %24assetType (which is $assetType)
      dataParam = `routes%2Fitem-shop.%24assetType.%24assetName`;
    }

    url = `https://www.fortnite.com/item-shop/${assetType}/${itemId}?lang=${lang}&_data=${dataParam}`;

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
