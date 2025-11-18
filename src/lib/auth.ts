import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import type { Provider } from "next-auth/providers";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter, AdapterUser } from "next-auth/adapters";
import { prisma } from "@/lib/prisma";
import { env } from "@/env";
import type { Role } from "@/generated/prisma/enums";

const providers: Provider[] = [];

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      profile(profile) {
        const fullName = profile.name ?? "";
        const [firstName, ...lastParts] = fullName.trim().split(" ");
        return {
          id: profile.sub,
          email: profile.email,
          username: profile.sub,
          role: "COMMUNITY" as Role,
          firstName: firstName || profile.given_name || null,
          lastName: lastParts.join(" ") || profile.family_name || null,
          avatarUrl: profile.picture ?? null,
        };
      },
    }),
  );
}

if (!providers.length) {
  console.warn(
    "Google OAuth credentials are missing. Sign-in will fail until they are configured.",
  );
}

const adapter = PrismaAdapter(prisma) as Adapter;
const originalCreateUser = adapter.createUser?.bind(adapter);
type ExtendedUser = AdapterUser & {
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  onboardingCompleted?: boolean;
};

if (originalCreateUser) {
  adapter.createUser = async (user) => {
    const { name, image, emailVerified: _emailVerifiedIgnored, ...rest } = user;
    void _emailVerifiedIgnored;
    const [firstName, ...lastParts] = (name ?? "").trim().split(" ");
    const extended = rest as ExtendedUser;
    return originalCreateUser({
      ...rest,
      firstName: extended.firstName ?? (firstName || null),
      lastName: extended.lastName ?? (lastParts.join(" ") || null),
      avatarUrl: extended.avatarUrl ?? image ?? null,
      onboardingCompleted: extended.onboardingCompleted ?? false,
    } as ExtendedUser);
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter,
  session: {
    strategy: "database",
  },
  providers,
  callbacks: {
    session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
        session.user.role = (user.role ?? "COMMUNITY") as Role;
        session.user.username = user.username;
        session.user.firstName = user.firstName;
        session.user.lastName = user.lastName;
        session.user.postcode = user.postcode;
        session.user.onboardingCompleted = user.onboardingCompleted;
      }

      return session;
    },
  },
  pages: {
    newUser: "/onboarding",
  },
});
