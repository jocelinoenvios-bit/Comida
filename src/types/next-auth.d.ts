import { UserRole } from "@/lib/constants";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      phone?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role?: UserRole;
    phone?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid?: string;
    role?: UserRole;
    phone?: string | null;
  }
}

import type { DefaultSession } from "next-auth";
