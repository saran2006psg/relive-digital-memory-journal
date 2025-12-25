/**
 * Performance utility functions
 */

/**
 * Debounce function to limit how often a function can be called
 * Useful for optimizing search inputs, window resize handlers, etc.
 * @param func - Function to debounce
 * @param wait - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function to ensure a function is only called once per time period
 * Useful for scroll handlers, mousemove events, etc.
 * @param func - Function to throttle
 * @param limit - Time limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * Batch multiple function calls into a single execution
 * Useful for batch API requests or batch state updates
 * @param func - Function to batch
 * @param wait - Delay in milliseconds
 * @returns Batched function
 */
export function batch<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null
  let argsList: Parameters<T>[] = []

  return function executedFunction(...args: Parameters<T>) {
    argsList.push(args)

    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      if (argsList.length > 0) {
        // Call function with all batched arguments
        argsList.forEach((batchedArgs) => {
          func(...batchedArgs)
        })
        argsList = []
      }
      timeoutId = null
    }, wait)
  }
}

/**
 * Memoize expensive function results
 * @param func - Function to memoize
 * @param getKey - Optional function to generate cache key
 * @returns Memoized function
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>()

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = getKey ? getKey(...args) : JSON.stringify(args)

    if (cache.has(key)) {
      return cache.get(key)!
    }

    const result = func(...args)
    cache.set(key, result)
    return result
  }) as T
}

/**
 * Create a simple LRU (Least Recently Used) cache
 * @param maxSize - Maximum number of items in cache
 * @returns Cache object with get/set/clear methods
 */
export function createLRUCache<K, V>(maxSize: number) {
  const cache = new Map<K, V>()

  return {
    get(key: K): V | undefined {
      if (!cache.has(key)) return undefined

      // Move to end (most recent)
      const value = cache.get(key)!
      cache.delete(key)
      cache.set(key, value)
      return value
    },

    set(key: K, value: V): void {
      // Remove oldest if at capacity
      if (cache.size >= maxSize) {
        const firstKey = cache.keys().next().value
        cache.delete(firstKey)
      }

      cache.set(key, value)
    },

    has(key: K): boolean {
      return cache.has(key)
    },

    clear(): void {
      cache.clear()
    },

    get size(): number {
      return cache.size
    }
  }
}

/**
 * Chunk an array into smaller arrays of specified size
 * Useful for batch processing large datasets
 * @param array - Array to chunk
 * @param size - Size of each chunk
 * @returns Array of chunks
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}
