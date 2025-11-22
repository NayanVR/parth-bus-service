import logger from '@/lib/logger';
import { TRPCError } from '@trpc/server';
import { TRPCContext } from '../trpc-context';

export const getUserHandler = ({ ctx }: { ctx: TRPCContext }) => {
    try {
        const user = ctx.user;
        return {
            status: 'success',
            data: {
                user,
            },
        };
    } catch (err: any) {
        logger.error({ err }, "getUserHandler failed");
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: err.message,
        });
    }
};