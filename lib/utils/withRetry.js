// lib/utils/withRetry.js
export function withRetry(fn, retries = 3, baseDelay = 300) {
  return async (...args) => {
    let lastError;
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        return await fn(...args);
      } catch (err) {
        lastError = err;
        if (attempt === retries - 1) break;
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw lastError;
  };
}