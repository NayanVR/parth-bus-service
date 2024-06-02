import { db } from "@/server/db";
import { deserializeUser } from "./auth-middleware";

export const createTRPCContext = async (opts: { headers: Headers }) => {
    const { user } = await deserializeUser();

    return {
        db,
        user,
        ...opts,
    };
};

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;