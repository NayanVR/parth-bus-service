import { usersTable } from "@/server/db/schema";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
    createUser: publicProcedure.input(z.object({
        email: z.string(),
        password: z.string(),
    })).mutation(async ({ ctx, input }) => {
        const user = await ctx.db.insert(usersTable).values(input).returning();
        return user;
    }),
    getUsers: publicProcedure.query(async ({ ctx }) => {
        const _users = await ctx.db.select().from(usersTable);
        const formatedUsers = _users.map((user) => {
            return {
                ...user,
                createdAt: user.createdAt.toISOString(),
                updatedAt: user.updatedAt.toISOString(),
            };
        });
        return formatedUsers;
    }),
});