import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { AppError } from '../../errors/app-error';

@Catch()
@Injectable()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const req = ctx.getRequest();
    const traceId = req.id || req.headers['x-request-id'] || cryptoRandom();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let body: any = {
      traceId,
      code: 'INTERNAL.SERVER_ERROR',
      message: 'Internal server error',
    };

    if (exception instanceof AppError) {
      status = exception.httpStatus;
      body = {
        traceId,
        code: exception.code,
        message: exception.message,
        details: exception.details ?? null,
      };
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const resp = exception.getResponse() as any;

      body = {
        traceId,
        code: resp?.code || mapStatusToDefaultCode(status),
        message: resp?.message || exception.message || 'Http Error',
        details: resp?.details || resp?.errors || null,
      };
    } else if (typeof exception?.message === 'string') {
      body = {
        traceId,
        code: 'UNCAUGHT.EXCEPTION',
        message: exception.message,
      };
    }

    res.status(status).json(body);
  }
}

function mapStatusToDefaultCode(status: number) {
  switch (status) {
    case 400:
      return 'REQUEST.BAD';
    case 401:
      return 'AUTH.UNAUTHORIZED';
    case 403:
      return 'AUTH.FORBIDDEN';
    case 404:
      return 'RESOURCE.NOT_FOUND';
    case 409:
      return 'RESOURCE.CONFLICT';
    case 422:
      return 'REQUEST.UNPROCESSABLE';
    default:
      return 'INTERNAL.SERVER_ERROR';
  }
}
function cryptoRandom() {
  try {
    return require('crypto').randomUUID();
  } catch {
    return Date.now().toString(36);
  }
}
