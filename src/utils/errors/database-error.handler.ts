import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';

interface DatabaseError {
  code?: string;
  detail?: string;
  constraint?: string;
  message?: string;
}

/**
 * Converts PostgreSQL / Drizzle database errors
 * into proper NestJS HTTP exceptions.
 */
export function handleDatabaseError(error: unknown): never {
  const dbError = error as DatabaseError;

  switch (dbError.code) {
    /**
     * PostgreSQL:
     * 23505 = unique_violation
     *
     * Example:
     * - Duplicate email
     * - Duplicate SKU
     */
    case '23505':
      throw new ConflictException(
        getUniqueViolationMessage(dbError),
      );

    /**
     * PostgreSQL:
     * 23503 = foreign_key_violation
     *
     * Example:
     * - Invalid vendorId
     * - Invalid productId
     */
    case '23503':
      throw new BadRequestException(
        'Referenced record does not exist',
      );

    /**
     * PostgreSQL:
     * 23502 = not_null_violation
     *
     * Example:
     * Required database field is missing.
     */
    case '23502':
      throw new BadRequestException(
        'Required field is missing',
      );

    /**
     * PostgreSQL:
     * 23514 = check_violation
     *
     * Example:
     * - Negative price
     * - Invalid stock quantity
     */
    case '23514':
      throw new BadRequestException(
        'Invalid data provided',
      );

    /**
     * PostgreSQL:
     * 22P02 = invalid_text_representation
     *
     * Example:
     * Trying to use "abc" where PostgreSQL expects an integer.
     */
    case '22P02':
      throw new BadRequestException(
        'Invalid data format',
      );

    /**
     * PostgreSQL:
     * 22003 = numeric_value_out_of_range
     */
    case '22003':
      throw new BadRequestException(
        'Numeric value is out of range',
      );

    /**
     * PostgreSQL:
     * 40001 = serialization_failure
     *
     * Usually caused by concurrent transactions.
     */
    case '40001':
      throw new ServiceUnavailableException(
        'Transaction could not be completed. Please try again',
      );

    /**
     * PostgreSQL:
     * 40P01 = deadlock_detected
     */
    case '40P01':
      throw new ServiceUnavailableException(
        'Database transaction conflict. Please try again',
      );

    /**
     * Unknown database error
     */
    default:
      console.error('Database error:', error);

      throw new InternalServerErrorException(
        'Database operation failed',
      );
  }
}

/**
 * Creates a better message for duplicate records.
 */
function getUniqueViolationMessage(
  error: DatabaseError,
): string {
  const constraint = error.constraint?.toLowerCase();

  if (constraint?.includes('email')) {
    return 'Email already exists';
  }

  if (constraint?.includes('sku') || constraint?.includes('hsn')) {
    return 'SKU already exists';
  }

  return 'Record already exists';
}