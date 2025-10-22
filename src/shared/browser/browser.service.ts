/**
 * Browser Service
 *
 * This service manages the Playwright browser instance for web scraping operations.
 * It implements the Singleton pattern to ensure only one browser instance is used
 * across the application, improving performance and resource management.
 *
 * @fileoverview Browser management service for Fortnite Item Shop Scraper API
 */

import { chromium, Browser, BrowserContext } from "playwright";
import { APP_CONFIG } from "../../config/app.config";

/**
 * Browser Service Class
 *
 * Manages Playwright browser instances for web scraping operations.
 * Implements Singleton pattern to ensure efficient resource usage.
 */
export class BrowserService {
  /** Singleton instance of the browser service */
  private static instance: BrowserService;
  /** Playwright browser instance */
  private browser: Browser | null = null;
  /** Browser context for page management */
  private context: BrowserContext | null = null;

  /**
   * Private constructor to enforce Singleton pattern
   */
  private constructor() {}

  /**
   * Get Singleton Instance
   *
   * Returns the singleton instance of the BrowserService.
   * Creates a new instance if one doesn't exist.
   *
   * @returns BrowserService - The singleton instance
   */
  public static getInstance(): BrowserService {
    if (!BrowserService.instance) {
      BrowserService.instance = new BrowserService();
    }
    return BrowserService.instance;
  }

  /**
   * Initialize Browser with Optimized Settings
   *
   * Initializes a new Playwright browser instance with optimized settings
   * for web scraping. Uses headless mode and performance-optimized arguments.
   *
   * @returns Promise<{ browser: Browser; context: BrowserContext }> - Browser and context instances
   * @throws Error if browser initialization fails
   */
  public async initBrowser(): Promise<{
    browser: Browser;
    context: BrowserContext;
  }> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
        args: [...APP_CONFIG.BROWSER_ARGS],
      });

      // Create persistent context with configured settings
      this.context = await this.browser.newContext({
        userAgent: APP_CONFIG.USER_AGENT,
        viewport: APP_CONFIG.VIEWPORT,
      });
    }

    if (!this.context) {
      throw new Error("Browser context not initialized");
    }

    return { browser: this.browser, context: this.context };
  }

  /**
   * Get Browser Context
   *
   * Returns the current browser context, initializing the browser if necessary.
   * This is the primary method used by other services to get a context for scraping.
   *
   * @returns Promise<BrowserContext> - The browser context
   * @throws Error if browser initialization fails
   */
  public async getContext(): Promise<BrowserContext> {
    const { context } = await this.initBrowser();
    return context;
  }

  /**
   * Close Browser and Context
   *
   * Safely closes the browser and context instances.
   * Handles errors gracefully to ensure cleanup completes.
   */
  public async close(): Promise<void> {
    try {
      if (this.context) {
        await this.context.close();
        this.context = null;
      }
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
    } catch (error) {
      console.error("Error during browser shutdown:", error);
    }
  }

  /**
   * Graceful Shutdown
   *
   * Performs a graceful shutdown of the browser service.
   * This method should be called when the application is shutting down.
   */
  public async shutdown(): Promise<void> {
    console.log("Shutting down browser service...");
    await this.close();
  }
}
