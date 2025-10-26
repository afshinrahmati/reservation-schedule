import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

type Details = unknown;

const shape = (code: string, message?: string, details?: Details) => ({
  code,
  message: message ?? code,
  details: details ?? null,
});

export const err = {
  badRequest: (code: string, message?: string, details?: Details) =>
    new BadRequestException(shape(code, message, details)),

  unauthorized: (code: string, message?: string, details?: Details) =>
    new UnauthorizedException(shape(code, message, details)),

  forbidden: (code: string, message?: string, details?: Details) =>
    new ForbiddenException(shape(code, message, details)),

  notFound: (code: string, message?: string, details?: Details) =>
    new NotFoundException(shape(code, message, details)),

  conflict: (code: string, message?: string, details?: Details) =>
    new ConflictException(shape(code, message, details)),

  internal: (code: string, message?: string, details?: Details) =>
    new InternalServerErrorException(shape(code, message, details)),

  custom: (status: number, code: string, message?: string, details?: Details) =>
    new HttpException(shape(code, message, details), status),
};
