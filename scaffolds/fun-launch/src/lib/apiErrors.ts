import { NextApiResponse } from 'next';

export type ValidationReason = 'missing' | 'too_short' | 'too_long' | 'invalid';

export interface ValidationDetail {
  field: string;
  reason: ValidationReason;
}

const JSON_CONTENT_TYPE = /^application\/json(\s*;\s*charset=utf-8)?$/i;

/**
 * Check that request has Content-Type: application/json (or application/json; charset=utf-8).
 * For POST/PUT/PATCH, call this at the start of the handler. Returns true if OK, false if 415 was sent.
 */
export function requireJsonContentType(
  contentType: string | undefined,
  res: NextApiResponse
): boolean {
  if (!contentType || !JSON_CONTENT_TYPE.test(contentType.trim())) {
    res.status(415).json({
      error: 'Content-Type must be application/json',
      code: 'UNSUPPORTED_MEDIA_TYPE',
    });
    return false;
  }
  return true;
}

/**
 * Send 400 validation error with code and optional details for agent-friendly parsing.
 */
export function validationError(
  res: NextApiResponse,
  message: string,
  details?: ValidationDetail[]
): void {
  res.status(400).json({
    error: message,
    code: 'VALIDATION_ERROR',
    ...(details && details.length > 0 ? { details } : {}),
  });
}

/**
 * Send 400 for a single invalid/missing field (convenience wrapper).
 */
export function invalidField(
  res: NextApiResponse,
  message: string,
  field: string,
  reason: ValidationReason = 'invalid'
): void {
  validationError(res, message, [{ field, reason }]);
}
