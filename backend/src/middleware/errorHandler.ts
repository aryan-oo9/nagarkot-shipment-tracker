import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  // 1. Zod Validation Errors -> 400
  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request payload or query parameters',
        details: err.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      },
    });
    return;
  }

  // 2. Custom AppErrors (NotFoundError, ConflictError, BadRequestError)
  if (err instanceof AppError || (err && typeof err.statusCode === 'number' && err.code)) {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    });
    return;
  }

  // 3. PostgreSQL Unique Constraint Violation -> 409
  if (err && err.code === '23505') {
    res.status(409).json({
      error: {
        code: 'CONFLICT',
        message: 'A resource with this identifier already exists',
      },
    });
    return;
  }

  // 4. PostgreSQL Check Constraint or Foreign Key Violation -> 400
  if (err && (err.code === '23514' || err.code === '23503')) {
    res.status(400).json({
      error: {
        code: 'BAD_REQUEST',
        message: 'Data constraint violation',
      },
    });
    return;
  }

  // 5. Unhandled / Unexpected Exceptions -> 500 Sanitized
  console.error('[Unhandled Internal Error]', {
    message: err?.message,
    name: err?.name,
    code: err?.code,
    stack: err?.stack,
  });

  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected internal server error occurred',
    },
  });
}
