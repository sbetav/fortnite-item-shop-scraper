import { chromium, Browser, BrowserContext } from "playwright";
import { APP_CONFIG } from "../../config/app.config";

export class BrowserService {
  private static instance: BrowserService;
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;

  private constructor() {}

  public static getInstance(): BrowserService {
    if (!BrowserService.instance) {
      BrowserService.instance = new BrowserService();
    }
    return BrowserService.instance;
  }

  /**
   * Initialize browser with optimized settings
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

      // Create persistent context
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
   * Get the current browser context
   */
  public async getContext(): Promise<BrowserContext> {
    const { context } = await this.initBrowser();
    return context;
  }

  /**
   * Close browser and context
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
   * Graceful shutdown
   */
  public async shutdown(): Promise<void> {
    console.log("Shutting down browser service...");
    await this.close();
  }
}
