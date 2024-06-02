import { env } from '@/env';
import { TRPCError } from '@trpc/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export const deserializeUser = async () => {
    const cookieStore = cookies();
    try {
        let token;
        if (cookieStore.get('token')) {
            token = cookieStore.get('token')?.value;
        }

        const notAuthenticated = {
            user: null,
        };

        if (!token) {
            return notAuthenticated;
        }
        const secret = env.JWT_SECRET!;
        const decoded = jwt.verify(token, secret) as { sub: string };

        if (!decoded) {
            return notAuthenticated;
        }

        return {
            user: {
                email: decoded.sub,
            },
        };
    } catch (err: any) {
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: err.message,
        });
    }
}