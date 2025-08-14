import newsDomainsData from '../news-domains.json';

const PRELOADED_NEWS_DOMAINS: string[] = newsDomainsData.map(d => d.domain);

export const storage = {
  set: async <T>(key: string, value: T) => {
    await chrome.storage.local.set({[key]: value});
    return;
  },

  get: async <T>(key: string, defaultValue: T) => {
    const result = await chrome.storage.local.get([key]);
    return result[key] ?? defaultValue;
  },

  add: async <T>(key: string, item: T) => {
    const list = await storage.get<T[]>(key, []);
    list.push(item);
    return storage.set(key, list);
  },

  remove: async <T>(key: string, item: T) => {
    const list: T[] = await storage.get<T[]>(key, []);
    const filteredList = list.filter(listItem => listItem !== item);
    return storage.set(key, filteredList);
  }
};

/**
 * Fetches the list of news domains from the storage. If no domains are found in storage,
 * it initialises the storage with a predefined set of news domains and returns it.
 *
 * @return {Promise<string[]>} A promise that resolves to an array of news domain strings.
 */
export async function getNewsDomains(): Promise<string[]> {
  const storedDomains: string[] = await storage.get<string[]>('NEWS_DOMAINS', []);

  if (storedDomains.length > 0)
    return storedDomains;

  await storage.set('NEWS_DOMAINS', PRELOADED_NEWS_DOMAINS);
  return PRELOADED_NEWS_DOMAINS;
}