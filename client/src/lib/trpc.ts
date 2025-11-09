import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../../server/supabaseRouters";

export const trpc = createTRPCReact<AppRouter>();
