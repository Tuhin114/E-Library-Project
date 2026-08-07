/**
 * Standardized success response shape.
 * Every successful endpoint responds with { success, statusCode, message, data }
 * so the frontend can rely on one consistent contract across all routes.
 */
export class ApiResponse {
  constructor(statusCode, message, data = null) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}
