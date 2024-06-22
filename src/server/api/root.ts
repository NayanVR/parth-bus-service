import { createCallerFactory, createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { userRouter } from "./routers/user";
import { authRouter } from "./routers/auth";
import { bookingsRouter } from "./routers/bookings";
import { driverRouter } from "./routers/driver-duty";
import { vehiclesRouter } from "./routers/vehicles";
import { maintenanceRouter } from "./routers/maintenance";
import { trashRouter } from "./routers/trash";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  auth: authRouter,
  bookings: bookingsRouter,
  driverDuty: driverRouter,
  vehicles: vehiclesRouter,
  maintenance: maintenanceRouter,
  trash: trashRouter,
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
