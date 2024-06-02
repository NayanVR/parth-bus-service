import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getUserHandler } from "../route-handlers/user-controller";

export const userRouter = createTRPCRouter({
    getUser: protectedProcedure.query(getUserHandler),
});