// app/api/auth/[...auth]/route.ts
// Endpoint handler para BetterAuth
import { auth } from "@/lib/auth/config";
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);
