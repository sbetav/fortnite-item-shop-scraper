/**
 * Calculate next shop refresh time (7:00 PM GMT-5 daily)
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
 * Get the most recent shop refresh time (7:00 PM GMT-5)
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
 * Get time until next shop refresh in seconds
 */
export function getSecondsUntilRefresh(): number {
  const nextRefresh = getNextShopRefresh();
  return Math.floor((nextRefresh.getTime() - Date.now()) / 1000);
}
