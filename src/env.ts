import { z } from "zod";

const serverSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required").optional(),
  NEXTAUTH_SECRET: z
    .string()
    .min(1, "NEXTAUTH_SECRET is required")
    .optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  GOOGLE_CLIENT_ID: z
    .string()
    .min(1, "GOOGLE_CLIENT_ID is required")
    .optional(),
  GOOGLE_CLIENT_SECRET: z
    .string()
    .min(1, "GOOGLE_CLIENT_SECRET is required")
    .optional(),
  RESEND_API_KEY: z.string().optional(),
  ADMIN_CONTACT_EMAIL: z
    .string()
    .email("ADMIN_CONTACT_EMAIL must be a valid email")
    .default("mathieu.bayou@gmail.com"),
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .url("NEXT_PUBLIC_SITE_URL must be a valid URL")
    .optional(),
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().optional(),
});
const serverEnv = serverSchema.parse(process.env);
export const env = {
  ...serverEnv,
};
