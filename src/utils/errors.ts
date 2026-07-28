export class AppError extends Error {
  readonly code: string;
  readonly recoverable: boolean;

  constructor(message: string, code = 'APP_ERROR', recoverable = true) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.recoverable = recoverable;
  }
}

export function toErrorMessage(error: unknown, fallback = 'Something went wrong') {
  if (error instanceof AppError || error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return fallback;
}
