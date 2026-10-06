import { Logger } from '@nestjs/common';

const logger = new Logger(
  'ProcessErrorHandler',
);

export function setupProcessErrorHandlers() {
  process.on(
    'uncaughtException',
    (error: Error) => {
      logger.error(
        `Uncaught Exception: ${error.message}`,
        error.stack,
      );

      process.exit(1);
    },
  );

  process.on(
    'unhandledRejection',
    (reason: unknown) => {
      logger.error(
        `Unhandled Rejection: ${
          reason instanceof Error
            ? reason.message
            : String(reason)
        }`,
        reason instanceof Error
          ? reason.stack
          : undefined,
      );

      process.exit(1);
    },
  );
}