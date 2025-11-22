import { env } from '@/env';
import logger from '@/lib/logger';
import { CreateUserInput, LoginUserInput } from '@/lib/types/user-schema';
import { usersTable } from '@/server/db/schema';
import { TRPCError } from '@trpc/server';
import bcrypt from "bcrypt";
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { TRPCContext } from '../trpc-context';

export const registerHandler = async ({ ctx, input }: { ctx: TRPCContext, input: CreateUserInput }) => {
    logger.info({ input: { email: input.email } }, "registerHandler called");
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(input.password, saltRounds);

        const res = (await ctx.db.insert(usersTable).values({
            email: input.email,
            password: hashedPassword,
        }).returning()).at(0);

        logger.info({ userId: res?.id }, "User registered successfully");

        return {
            status: 'success',
            data: {
                user: {
                    email: res?.email,
                },
            },
        };
    } catch (err: any) {
        logger.error({ err }, "Register failed");
        if (err.code === 'P2002') {
            throw new TRPCError({
                code: 'CONFLICT',
                message: 'Email already exists',
            });
        }
        throw err;
    }
}

export const loginHandler = async ({ ctx, input }: { ctx: TRPCContext, input: LoginUserInput }) => {
    logger.info({ email: input.email }, "loginHandler called");
    try {
        const user = (await ctx.db.select().from(usersTable).where(eq(usersTable.email, input.email))).at(0);

        if (!user) {
            logger.warn({ email: input.email }, "Login failed: Email does not exist");
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Email does not exist',
            });
        }

        const validPassword = await bcrypt.compare(input.password, user.password);

        if (!validPassword) {
            logger.warn({ email: input.email }, "Login failed: Invalid password");
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Invalid password',
            });
        }

        const secret = env.JWT_SECRET!;
        const token = jwt.sign({ sub: input.email }, secret, {
            expiresIn: 60 * 60 * 24 * 30,
        });

        const cookieOptions = {
            httpOnly: true,
            path: '/',
            secure: process.env.NODE_ENV !== 'development',
            maxAge: 60 * 60 * 24 * 30,
        };

        cookies().set('token', token, cookieOptions);

        logger.info({ userId: user.id }, "Login successful");

        return {
            status: 'success',
            token,
        };
    } catch (err: any) {
        logger.error({ err }, "Login failed");
        throw err;
    }
}

export const logoutHandler = async () => {
    logger.info("logoutHandler called");
    try {
        cookies().set('token', '', {
            maxAge: -1,
        });
        logger.info("Logout successful");
        return { status: 'success' };
    } catch (err: any) {
        logger.error({ err }, "Logout failed");
        throw err;
    }
};