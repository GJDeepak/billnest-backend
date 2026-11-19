import {
  BadRequestException,
  ConflictException,
  HttpException,
  InternalServerErrorException,
  ServiceUnavailableException,
} from "@nestjs/common";

interface DatabaseError {
  code?: string;
  detail?: string;
  constraint?: string;
  message?: string;
  table?: string;
  schema?: string;
  column?: string;
  severity?: string;
  cause?: unknown;
}

/**
 * Extracts the actual PostgreSQL error
 * from Drizzle or nested errors.
 */
function getDatabaseError(error: unknown): DatabaseError {
  let current: unknown = error;

  while (current && typeof current === "object") {
    const dbError = current as DatabaseError;

    // PostgreSQL error found
    if (dbError.code) {
      return dbError;
    }

    // Move to nested cause
    current = dbError.cause;
  }

  return {};
}

/**
 * Converts PostgreSQL / Drizzle database errors
 * into proper NestJS HTTP exceptions.
 */
export function handleDatabaseError(error: unknown): never {

  // 1. Preserve existing NestJS HTTP exceptions
  if (error instanceof HttpException) {
    throw error;
  }

  // 2. Extract actual PostgreSQL error
  const dbError = getDatabaseError(error);

  const errorMessage = dbError.detail ?? dbError.message ?? "Database operation failed";

  // 3. Handle PostgreSQL errors
  switch (dbError.code) {

    /**
     * 23505 = unique_violation
     */
    case "23505":
      throw new ConflictException(getUniqueViolationMessage(dbError));

    /**
     * 23503 = foreign_key_violation
     */
    case "23503":
      throw new BadRequestException("Referenced record does not exist");

    /**
     * 23502 = not_null_violation
     */
    case "23502":
      throw new BadRequestException("Required field is missing");

    /**
     * 23514 = check_violation
     */
    case "23514":
      throw new BadRequestException("Invalid data provided");

    /**
     * 22P02 = invalid_text_representation
     */
    case "22P02":
      throw new BadRequestException("Invalid data format");

    /**
     * 22003 = numeric_value_out_of_range
     */
    case "22003":
      throw new BadRequestException("Numeric value is out of range");

    /**
     * 40001 = serialization_failure
     */
    case "40001":
      throw new ServiceUnavailableException("Transaction could not be completed. Please try again");

    /**
     * 40P01 = deadlock_detected
     */
    case "40P01":
      throw new ServiceUnavailableException("Database transaction conflict. Please try again");

    /**
     * Unknown database error
     */
    default:
      console.error("Database Error:", {
        code: dbError.code,
        message: dbError.message,
        detail: dbError.detail,
        constraint: dbError.constraint,
        table: dbError.table,
        schema: dbError.schema,
        column: dbError.column,
        originalError: error,
      });

      throw new InternalServerErrorException("Database operation failed");
  }
}

/**
 * Creates meaningful messages for duplicate records.
 */
function getUniqueViolationMessage(error: DatabaseError): string {
  const constraint = error.constraint?.toLowerCase();

  if (!constraint) {
    return "Record already exists";
  }

  switch (true) {
    case constraint.includes("email"):
      return "Email already exists";

    case constraint.includes("sku"):
      return "SKU code already exists";

    case constraint.includes("hsn"):
      return "HSN code already exists";

    case constraint === "products_shop_product_code_unique":
      return "Product Code or Product is duplicated";

    default:
      return "Record already exists";
  }
}
