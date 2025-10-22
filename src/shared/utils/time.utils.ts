/**
 * Time Utilities
 *
 * This module provides utility functions for calculating Fortnite item shop
 * refresh times and related time-based operations. The item shop refreshes
 * daily at 7:00 PM GMT-5 (midnight UTC).
 *
 * @fileoverview Time utility functions for Fortnite Item Shop Scraper API
 */

/**
 * Calculate Next Shop Refresh Time
 *
 * Calculates the next Fortnite item shop refresh time.
 * The shop refreshes daily at 7:00 PM GMT-5 (midnight UTC).
 *
 * @returns Date - The next shop refresh time
 */
export function getNextShopRefresh(): Date {
  const now = new Date();
  const refreshTime = new Date();

  // Set to 7:00 PM GMT-5 (which is midnight UTC)
  refreshTime.setUTCHours(0, 0, 0, 0);

  // If current time is past today's refresh, set to tomorrow's refresh
  if (now >= refreshTime) {
    refreshTime.setUTCDate(refreshTime.getUTCDate() + 1);
  }

  return refreshTime;
}

/**
 * Get the Most Recent Shop Refresh Time
 *
 * Calculates the most recent Fortnite item shop refresh time.
 * Returns yesterday's refresh if the current time is before today's refresh.
 *
 * @returns Date - The most recent shop refresh time
 */
export function getLastShopRefresh(): Date {
  const now = new Date();
  const lastRefresh = new Date();

  // Set to 7:00 PM GMT-5 (which is midnight UTC)
  lastRefresh.setUTCHours(0, 0, 0, 0);

  // If current time is before today's refresh, use yesterday's refresh
  if (now < lastRefresh) {
    lastRefresh.setUTCDate(lastRefresh.getUTCDate() - 1);
  }

  return lastRefresh;
}

/**
 * Get Time Until Next Shop Refresh
 *
 * Calculates the number of seconds until the next shop refresh.
 * Useful for caching and determining when to fetch fresh data.
 *
 * @returns number - Seconds until the next shop refresh
 */
export function getSecondsUntilRefresh(): number {
  const nextRefresh = getNextShopRefresh();
  return Math.floor((nextRefresh.getTime() - Date.now()) / 1000);
}
