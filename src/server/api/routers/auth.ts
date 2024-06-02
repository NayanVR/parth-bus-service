import { createUserSchema, loginUserSchema } from "@/lib/types/user-schema";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { loginHandler, registerHandler } from "../route-handlers/auth-controller";

export const authRouter = createTRPCRouter({
    register: publicProcedure.input(createUserSchema).mutation(registerHandler),
    login: publicProcedure.input(loginUserSchema).mutation(loginHandler),
});