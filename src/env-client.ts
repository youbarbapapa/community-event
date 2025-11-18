import { z } from "zod";

const schema = z.object({
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().optional(),
});

export const clientEnv = schema.parse({
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
});
