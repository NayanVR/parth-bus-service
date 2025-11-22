import pino from 'pino';
import pretty from 'pino-pretty';

const globalForLogger = globalThis as unknown as { logger: pino.Logger };

const stream = pretty({
    colorize: true,
});

const logger =
    globalForLogger.logger ??
    pino(
        {
            level: process.env.LOG_LEVEL || 'info',
        },
        stream
    );

if (process.env.NODE_ENV !== 'production') globalForLogger.logger = logger;

export default logger;