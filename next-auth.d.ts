import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: {
      id?: number;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: "USER" | "ADMIN";
    };
  }
  interface User extends DefaultUser {
    role?: "USER" | "ADMIN";
    id?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "USER" | "ADMIN";
    id?: number;
  }
}
