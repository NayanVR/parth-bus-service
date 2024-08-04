import { CreateUserInput, LoginUserInput } from 'src/lib/types/user-schema';
import { TRPCError } from '@trpc/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { env } from '@/env';
import { TRPCContext } from '../trpc-context';
import { usersTable } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from "bcrypt";

export const registerHandler = async ({ ctx, input }: { ctx: TRPCContext, input: CreateUserInput }) => {
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(input.password, saltRounds);

        const res = (await ctx.db.insert(usersTable).values({
            email: input.email,
            password: hashedPassword,
        }).returning()).at(0);

        return {
            status: 'success',
            data: {
                user: {
                    email: res?.email,
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

export const loginHandler = async ({ ctx, input }: { ctx: TRPCContext, input: LoginUserInput }) => {
    try {
        const user = (await ctx.db.select().from(usersTable).where(eq(usersTable.email, input.email))).at(0);

        if (!user) {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Email does not exist',
            });
        }

        const validPassword = await bcrypt.compare(input.password, user.password);

        if (!validPassword) {
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