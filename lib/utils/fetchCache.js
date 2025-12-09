/**
 * Request Deduplication and Caching Utility
 * Prevents duplicate API calls and provides intelligent caching
 */

// In-memory cache for request deduplication
const pendingRequests = new Map();

// Cache for successful responses (short-lived, 30 seconds)
const responseCache = new Map();
const CACHE_DURATION = 30 * 1000; // 30 seconds

/**
 * Deduplicated fetch - prevents multiple identical requests
 * @param {string} url - API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise<Response>}
 */
export async function deduplicatedFetch(url, options = {}) {
  const cacheKey = `${url}_${JSON.stringify(options)}`;
  
  // Check response cache first (before checking pending requests)
  const cached = responseCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    // Always return a fresh clone to avoid "body stream already read" error
    return Promise.resolve(cached.response.clone());
  }

  // Check if request is already pending
  if (pendingRequests.has(cacheKey)) {
    // Wait for the pending request and clone the response for this caller
    const pendingResponse = await pendingRequests.get(cacheKey);
    return pendingResponse.clone();
  }

  // Create new request
  const requestPromise = fetch(url, options)
    .then(async (response) => {
      // Clone the response before caching to preserve the original
      const responseClone = response.clone();
      
      // Cache successful responses (cache the clone, return original)
      if (response.ok) {
        responseCache.set(cacheKey, {
          response: responseClone,
          timestamp: Date.now(),
        });
      }
      
      // Clean up pending request
      pendingRequests.delete(cacheKey);
      
      // Clean up old cache entries periodically
      if (responseCache.size > 100) {
        const now = Date.now();
        for (const [key, value] of responseCache.entries()) {
          if (now - value.timestamp > CACHE_DURATION) {
            responseCache.delete(key);
          }
        }
      }
      
      // Return the original response (not the clone)
      return response;
    })
    .catch((error) => {
      pendingRequests.delete(cacheKey);
      throw error;
    });

  pendingRequests.set(cacheKey, requestPromise);
  return requestPromise;
}

/**
 * Clear all caches
 */
export function clearFetchCache() {
  pendingRequests.clear();
  responseCache.clear();
}

/**
 * Clear cache for specific URL pattern
 */
export function clearCacheForPattern(pattern) {
  for (const key of responseCache.keys()) {
    if (key.includes(pattern)) {
      responseCache.delete(key);
    }
  }
  for (const key of pendingRequests.keys()) {
    if (key.includes(pattern)) {
      pendingRequests.delete(key);
    }
  }
}

