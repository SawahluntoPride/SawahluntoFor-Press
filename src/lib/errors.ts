/**
 * Standardized error response utilities
 * Use these to ensure consistent error responses across the API
 */

/**
 * Standard error response format
 */
export interface ApiError {
  error: string;
  code: string;
  details?: unknown;
  status?: number;
}

/**
 * Common error codes
 */
export const ErrorCodes = {
  // Authentication errors
  UNAUTHORIZED: "UNAUTHORIZED",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  INSUFFICIENT_PERMISSIONS: "INSUFFICIENT_PERMISSIONS",
  SESSION_EXPIRED: "SESSION_EXPIRED",
  
  // Validation errors
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_INPUT: "INVALID_INPUT",
  MISSING_REQUIRED_FIELD: "MISSING_REQUIRED_FIELD",
  
  // Resource errors
  NOT_FOUND: "NOT_FOUND",
  ALREADY_EXISTS: "ALREADY_EXISTS",
  CONFLICT: "CONFLICT",
  
  // File errors
  FILE_TOO_LARGE: "FILE_TOO_LARGE",
  INVALID_FILE_TYPE: "INVALID_FILE_TYPE",
  INVALID_EXTENSION: "INVALID_EXTENSION",
  FILE_UPLOAD_FAILED: "FILE_UPLOAD_FAILED",
  
  // Server errors
  SERVER_ERROR: "SERVER_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  
  // Business logic errors
  INVALID_STATUS: "INVALID_STATUS",
  INVALID_STATE: "INVALID_STATE",
  NOT_ALLOWED: "NOT_ALLOWED",
} as const;

/**
 * Create a standardized error response
 */
export function createError(
  message: string,
  code: keyof typeof ErrorCodes,
  details?: unknown,
  status: number = 400,
): ApiError {
  return {
    error: message,
    code,
    details,
    status,
  };
}

/**
 * Common error responses
 */
export const Errors = {
  unauthorized: (message: string = "Authentikasi diperlukan.") =>
    createError(message, ErrorCodes.UNAUTHORIZED, undefined, 401),
  
  invalidCredentials: (message: string = "Email atau kata sandi salah.") =>
    createError(message, ErrorCodes.INVALID_CREDENTIALS, undefined, 401),
  
  insufficientPermissions: (message: string = "Tidak berhak.") =>
    createError(message, ErrorCodes.INSUFFICIENT_PERMISSIONS, undefined, 403),
  
  notFound: (resource: string = "Resource") =>
    createError(`${resource} tidak ditemukan.`, ErrorCodes.NOT_FOUND, undefined, 404),
  
  validationError: (message: string, details?: unknown) =>
    createError(message, ErrorCodes.VALIDATION_ERROR, details, 400),
  
  fileTooLarge: (maxSize: string = "4 MB") =>
    createError(`Ukuran maksimal ${maxSize}.`, ErrorCodes.FILE_TOO_LARGE, undefined, 400),
  
  invalidFileType: (allowedTypes: string[] = ["PDF"]) =>
    createError(
      `Hanya file ${allowedTypes.join(", ")} yang diterima.`,
      ErrorCodes.INVALID_FILE_TYPE,
      undefined,
      400,
    ),
  
  invalidExtension: (allowedExtensions: string[] = [".pdf"]) =>
    createError(
      `Hanya ekstensi ${allowedExtensions.join(", ")} yang diizinkan.`,
      ErrorCodes.INVALID_EXTENSION,
      undefined,
      400,
    ),
  
  serverError: (message: string = "Terjadi kesalahan di server.") =>
    createError(message, ErrorCodes.SERVER_ERROR, undefined, 500),
  
  notAllowed: (message: string = "Tindakan tidak diizinkan.") =>
    createError(message, ErrorCodes.NOT_ALLOWED, undefined, 400),
  
  alreadyExists: (resource: string = "Resource") =>
    createError(`${resource} sudah ada.`, ErrorCodes.ALREADY_EXISTS, undefined, 409),
};

/**
 * Format Zod validation errors into a standardized format
 */
export function formatZodErrors(errors: Record<string, string[]>): ApiError {
  const errorMessages = Object.entries(errors).map(
    ([field, messages]) => `${field}: ${messages.join(", ")}`,
  );
  return createError(
    errorMessages.join("; "),
    ErrorCodes.VALIDATION_ERROR,
    errors,
    400,
  );
}
