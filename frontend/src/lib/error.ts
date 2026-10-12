/**
 * API Error Normalization Utility
 * Safely extracts human-readable error messages from diverse API responses,
 * including FastAPI/Pydantic validation errors, standard HTTP errors,
 * network failures, and generic exceptions.
 * 
 * Never exposes raw error objects, input values, or internal details to JSX.
 */

export interface ValidationErrorItem {
  type?: string;
  loc?: (string | number)[];
  msg?: string;
  input?: any;
  ctx?: Record<string, any>;
  url?: string;
}

/**
 * Format a field location array (e.g. ['body', 'password'] or ['password'])
 * into a friendly field label (e.g. "Password").
 */
function formatFieldLocation(loc?: (string | number)[]): string {
  if (!loc || !Array.isArray(loc) || loc.length === 0) return '';
  // Ignore prefixes like 'body', 'query', 'header', 'path'
  const filtered = loc.filter(
    (part) => typeof part === 'string' && !['body', 'query', 'header', 'path'].includes(part)
  );
  if (filtered.length === 0) return '';
  
  const fieldName = String(filtered[filtered.length - 1]);
  // Convert snake_case to Title Case: "full_name" -> "Full Name"
  return fieldName
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Clean up common Pydantic validation prefixes
 */
function cleanValidationMessage(msg: string): string {
  if (!msg) return 'Invalid value';
  return msg
    .replace(/^Value error,\s*/i, '')
    .replace(/^Assertion failed,\s*/i, '');
}

/**
 * Normalizes any error or API response into a safe, human-readable string.
 * Guaranteed to return a non-empty string suitable for rendering directly in JSX.
 */
export function getErrorMessage(error: unknown, fallbackMessage = 'An unexpected error occurred. Please try again.'): string {
  if (!error) {
    return fallbackMessage;
  }

  // 1. Plain string
  if (typeof error === 'string') {
    return error.trim() || fallbackMessage;
  }

  // 2. Axios / HTTP error structure
  const err = error as any;
  const response = err.response;
  const data = response?.data;

  if (data) {
    // 2a. FastAPI "detail" field
    if (data.detail !== undefined && data.detail !== null) {
      // Case A: detail is a plain string
      if (typeof data.detail === 'string') {
        return data.detail.trim() || fallbackMessage;
      }

      // Case B: detail is an array of Pydantic validation errors
      // e.g. [{ type, loc, msg, input, ctx, url }]
      if (Array.isArray(data.detail) && data.detail.length > 0) {
        const messages = data.detail
          .map((item: any) => {
            if (typeof item === 'string') return item;
            if (typeof item === 'object' && item !== null) {
              const field = formatFieldLocation(item.loc);
              const cleanMsg = cleanValidationMessage(item.msg || 'is invalid');
              return field ? `${field}: ${cleanMsg}` : cleanMsg;
            }
            return null;
          })
          .filter(Boolean);

        if (messages.length > 0) {
          return messages.join('. ');
        }
      }

      // Case C: detail is a single validation error object
      if (typeof data.detail === 'object') {
        const field = formatFieldLocation(data.detail.loc);
        const cleanMsg = cleanValidationMessage(data.detail.msg || '');
        if (cleanMsg) {
          return field ? `${field}: ${cleanMsg}` : cleanMsg;
        }
      }
    }

    // 2b. Standard "message" or "error" property
    if (typeof data.message === 'string' && data.message.trim()) {
      return data.message.trim();
    }
    if (typeof data.error === 'string' && data.error.trim()) {
      return data.error.trim();
    }

    // 2c. Validation field errors object: { errors: { email: ['invalid'] } }
    if (data.errors && typeof data.errors === 'object') {
      const fieldErrors: string[] = [];
      for (const [key, val] of Object.entries(data.errors)) {
        if (Array.isArray(val)) {
          fieldErrors.push(`${key}: ${val.join(', ')}`);
        } else if (typeof val === 'string') {
          fieldErrors.push(`${key}: ${val}`);
        }
      }
      if (fieldErrors.length > 0) {
        return fieldErrors.join('. ');
      }
    }
  }

  // 3. Network connection errors
  if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
    return 'Unable to connect to the server. Please check your internet connection.';
  }

  if (err.code === 'ECONNABORTED' || (err.message && err.message.includes('timeout'))) {
    return 'Request timed out. Please try again.';
  }

  // 4. Standard JS Error
  if (err instanceof Error && typeof err.message === 'string' && err.message.trim()) {
    // Avoid displaying unhelpful internal technical strings
    if (!err.message.includes('[object Object]')) {
      return err.message.trim();
    }
  }

  return fallbackMessage;
}
