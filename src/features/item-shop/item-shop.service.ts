/**
 * Item Shop Service
 *
 * This service handles all operations related to scraping Fortnite item shop data.
 * It provides methods for fetching the complete item shop and individual items
 * with support for multiple languages.
 *
 * @fileoverview Service for Fortnite Item Shop data scraping
 */

import { BrowserService } from "../../shared/browser/browser.service";
import { APP_CONFIG, API_ENDPOINTS } from "../../config/app.config";
import {
  ItemShopData,
  ItemData,
  SupportedLanguage,
  DEFAULT_LANGUAGE,
} from "./item-shop.types";

/**
 * Item Shop Service Class
 *
 * Handles all item shop related operations including:
 * - Scraping complete item shop data
 * - Fetching individual item details
 * - Language support for internationalization
 */
export class ItemShopService {
  /** Browser service instance for web scraping operations */
  private browserService: BrowserService;

  /**
   * Initialize the Item Shop Service
   *
   * Creates a new instance and initializes the browser service.
   */
  constructor() {
    this.browserService = BrowserService.getInstance();
  }

  /**
   * Common Scraping Function for Fortnite Data
   *
   * A reusable method that handles the common pattern of scraping data from
   * Fortnite's API endpoints. It uses the browser service to make requests
   * and parse JSON responses.
   *
   * @param url - The Fortnite API endpoint URL to scrape
   * @returns Promise<any> - The parsed JSON data from the API
   * @throws Error if the request fails or data cannot be parsed
   */
  private async scrapeFortniteData(url: string): Promise<any> {
    const context = await this.browserService.getContext();
    const page = await context.newPage();

    try {
      const response = await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: APP_CONFIG.BROWSER_TIMEOUT,
      });

      const data = await response!.json();

      await page.close();
      return data;
    } catch (error) {
      await page.close();
      console.error(`Error scraping data from ${url}:`, error);
      throw error;
    }
  }

  /**
   * Scrape Item Shop Data
   *
   * Fetches the complete item shop data from Fortnite's API for the specified language.
   * This includes all currently available items, bundles, and featured content.
   *
   * @param lang - Language code for the data (defaults to 'en-US')
   * @returns Promise<ItemShopData> - Complete item shop data
   * @throws Error if the request fails or data cannot be parsed
   */
  public async scrapeItemShop(
    lang: SupportedLanguage = DEFAULT_LANGUAGE
  ): Promise<ItemShopData> {
    return await this.scrapeFortniteData(API_ENDPOINTS.ITEM_SHOP(lang));
  }

  /**
   * Scrape Individual Item Data
   *
   * Fetches detailed information for a specific item from the Fortnite item shop.
   * Supports different asset types including bundles, outfits, emotes, etc.
   *
   * @param assetType - Type of asset (bundles, outfits, emotes, etc.)
   * @param itemId - Unique identifier for the item
   * @param lang - Language code for the data (defaults to 'en-US')
   * @returns Promise<ItemData> - Detailed item data
   * @throws Error if the request fails or data cannot be parsed
   */
  public async scrapeItem(
    assetType: string,
    itemId: string,
    lang: SupportedLanguage = DEFAULT_LANGUAGE
  ): Promise<ItemData> {
    let url: string;
    let dataParam: string;

    if (assetType === "bundles") {
      dataParam = `routes%2Fitem-shop.bundles.%24bundleName`;
    } else if (assetType === "jamtrack" || assetType === "jam-tracks") {
      dataParam = `routes%2Fitem-shop.jam-tracks.%24assetName`;
      assetType = "jam-tracks";
    } else {
      dataParam = `routes%2Fitem-shop.%24assetType.%24assetName`;
    }
    url = `https://www.fortnite.com/item-shop/${assetType}/${itemId}?lang=${lang}&_data=${dataParam}`;

    const context = await this.browserService.getContext();
    const page = await context.newPage();

    try {
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
