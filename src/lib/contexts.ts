import { createContext } from "react";

export const BookingsDataRangeContext = createContext({
    from: new Date(),
    to: new Date(),
});