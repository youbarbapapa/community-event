import type { Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: string;
      username: string;
      role: Role;
      firstName?: string | null;
      lastName?: string | null;
      postcode?: string | null;
      onboardingCompleted?: boolean | null;
    };
  }

  interface User {
    username: string;
    role: Role;
    firstName?: string | null;
    lastName?: string | null;
    postcode?: string | null;
    onboardingCompleted?: boolean;
  }
}
