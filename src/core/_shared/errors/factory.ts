import { AppError } from './app-error';

export const err = {
  badRequest: (code: string, message: string, details?: any) =>
    new AppError(code, message, 400, details),
  unauthorized: (code: string, message: string, details?: any) =>
    new AppError(code, message, 401, details),
  forbidden: (code: string, message: string, details?: any) =>
    new AppError(code, message, 403, details),
  notFound: (code: string, message: string, details?: any) =>
    new AppError(code, message, 404, details),
  conflict: (code: string, message: string, details?: any) =>
    new AppError(code, message, 409, details),
  unprocessable: (code: string, message: string, details?: any) =>
    new AppError(code, message, 422, details),
};