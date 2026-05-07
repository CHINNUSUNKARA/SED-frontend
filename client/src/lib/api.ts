import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { clearAuthStorage } from '../services/authService';

// Extend Axios types to support per-request metadata and retry tracking.
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    metadata?: { startTime: number };
    _retryCount?: number;
  }
}

// Request cache for GET requests
interface CacheEntry {
  data: any;
  timestamp: number;
}

class RequestCache {
  private cache = new Map<string, CacheEntry>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes cache

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  set(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clear(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

// Request deduplication - prevent duplicate simultaneous requests
class RequestDeduplicator {
  private pending = new Map<string, Promise<any>>();

  async dedupe<T>(key: string, fn: () => Promise<T>): Promise<T> {
    if (this.pending.has(key)) {
      return this.pending.get(key) as Promise<T>;
    }

    const promise = fn().finally(() => {
      this.pending.delete(key);
    });

    this.pending.set(key, promise);
    return promise;
  }
}

const cache = new RequestCache();
const deduplicator = new RequestDeduplicator();

// Create axios instance with optimized config
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  withCredentials: true,
  timeout: 15000, // 15 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
  // Enable HTTP/2 multiplexing if available
  maxRedirects: 3,
  // Connection pooling
  maxContentLength: 10 * 1024 * 1024, // 10MB
  maxBodyLength: 10 * 1024 * 1024,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request timestamp for performance monitoring
    config.metadata = { startTime: Date.now() };

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor with caching and retry logic
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response time
    const duration = Date.now() - (response.config.metadata?.startTime || 0);
    if (duration > 3000) {
      console.warn(`Slow API request: ${response.config.method?.toUpperCase()} ${response.config.url} took ${duration}ms`);
    }

    // Cache GET requests
    if (response.config.method?.toLowerCase() === 'get') {
      const cacheKey = `${response.config.url}?${JSON.stringify(response.config.params || {})}`;
      cache.set(cacheKey, response.data);
    }

    return response;
  },
  async (error: AxiosError) => {
    const config = error.config as any;

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      clearAuthStorage();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    // Retry logic for network errors and 5xx errors
    const shouldRetry = 
      !error.response || // Network error
      (error.response.status >= 500 && error.response.status < 600) || // Server error
      error.code === 'ECONNABORTED'; // Timeout

    if (shouldRetry && (!config._retryCount || config._retryCount < 2)) {
      config._retryCount = (config._retryCount || 0) + 1;
      
      // Exponential backoff: 500ms, 1000ms, 2000ms
      const delay = Math.min(1000 * Math.pow(2, config._retryCount - 1), 2000);
      
      console.log(`Retrying request (${config._retryCount}/2) after ${delay}ms:`, config.url);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return api.request(config);
    }

    // Enhanced error logging
    if (error.response) {
      console.error('API Error - Response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
      });
    } else if (error.request) {
      console.error('API Error - No response received:', {
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        timeout: error.code === 'ECONNABORTED',
      });
    } else {
      console.error('API Error - Request setup failed:', error.message);
    }

    return Promise.reject(error);
  }
);

// Enhanced GET with caching and deduplication
export const get = <T = any>(
  url: string,
  config?: AxiosRequestConfig & { skipCache?: boolean }
): Promise<AxiosResponse<T>> => {
  const cacheKey = `${url}?${JSON.stringify(config?.params || {})}`;
  
  // Check cache first (unless skipCache is true)
  if (!config?.skipCache) {
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log(`Cache hit: ${url}`);
      return Promise.resolve({ data: cached } as AxiosResponse<T>);
    }
  }

  // Deduplicate simultaneous requests
  return deduplicator.dedupe(cacheKey, () => api.get<T>(url, config));
};

// POST with cache invalidation
export const post = <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  // Invalidate related cache entries
  const resourcePath = url.split('/')[1]; // e.g., 'courses' from '/courses/123'
  cache.clear(resourcePath);
  
  return api.post<T>(url, data, config);
};

// PUT with cache invalidation
export const put = <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  const resourcePath = url.split('/')[1];
  cache.clear(resourcePath);
  
  return api.put<T>(url, data, config);
};

// DELETE with cache invalidation
export const del = <T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  const resourcePath = url.split('/')[1];
  cache.clear(resourcePath);
  
  return api.delete<T>(url, config);
};

// Create request with AbortController for cancellation
export const createCancellableRequest = () => {
  const controller = new AbortController();
  
  return {
    signal: controller.signal,
    cancel: () => controller.abort(),
  };
};

// Batch multiple requests efficiently
export const batchRequests = async <T>(
  requests: Array<() => Promise<AxiosResponse<T>>>
): Promise<AxiosResponse<T>[]> => {
  return Promise.all(requests.map(req => req()));
};

// Clear all cache
export const clearCache = (pattern?: string) => {
  cache.clear(pattern);
};

// Prefetch data for better UX
export const prefetch = async (url: string, config?: AxiosRequestConfig) => {
  try {
    await get(url, config);
  } catch (error) {
    // Silently fail prefetch
    console.debug('Prefetch failed:', url);
  }
};

export default api;
