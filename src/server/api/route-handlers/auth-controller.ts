import { CreateUserInput, LoginUserInput } from 'src/lib/types/user-schema';
import { TRPCError } from '@trpc/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { env } from '@/env';

export const registerHandler = async ({
    input
}: {
    input: CreateUserInput;
}) => {
    try {
        return {
            status: 'success',
            data: {
                user: {
                    email: input.email,
                },
            },
        };
    } catch (err: any) {
        if (err.code === 'P2002') {
            throw new TRPCError({
                code: 'CONFLICT',
                message: 'Email already exists',
            });
        }
        throw err;
    }
}

export const loginHandler = async ({
    input
}: {
    input: LoginUserInput;
}) => {
    try {
        if (input.email !== "abc@xyz.in") {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Invalid email or password',
            });
        }

        const secret = env.JWT_SECRET!;
        const token = jwt.sign({ sub: input.email }, secret, {
            expiresIn: 60 * 60,
        });

        const cookieOptions = {
            httpOnly: true,
            path: '/',
            secure: process.env.NODE_ENV !== 'development',
            maxAge: 60 * 60,
        };

        cookies().set('token', token, cookieOptions);

        return {
            status: 'success',
            token,
        };
    } catch (err: any) {
        throw err;
    }
}

export const logoutHandler = async () => {
    try {
        cookies().set('token', '', {
            maxAge: -1,
        });
        return { status: 'success' };
    } catch (err: any) {
        throw err;
    }
};