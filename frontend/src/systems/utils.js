import stores from '@/stores';
import { fetchAllPlatforms } from '@spinamp/spinamp-sdk';

export const waitForElem = async (selector) => {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver((mutations) => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
};

export const getPlatformName = (data, platforms = null) => {
  if (!platforms) platforms = stores.useSpinamp((state) => state.platforms);

  if (!platforms.length) return data.platformId;

  const platform = platforms.find((p) => p.id === data.platformId);
  return platform.name;
};
