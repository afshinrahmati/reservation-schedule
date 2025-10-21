export class AppError extends Error {
  readonly code: string;
  readonly httpStatus: number;
  readonly details?: any;
  constructor(code: string, message: string, httpStatus = 400, details?: any) {
    super(message);
    this.code = code;
    this.httpStatus = httpStatus;
    this.details = details;
  }
}