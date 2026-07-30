import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@/lib/constants";

// MVP: OTP simulado. Em produção, integrar com provedor de SMS (Zenvia, Twilio...)
// e validar o código real enviado ao telefone antes de autenticar.
const DEV_OTP = "0000";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  trustHost: true,
  pages: { signIn: "/entrar" },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      id: "phone",
      name: "Telefone",
      credentials: {
        phone: { label: "Telefone", type: "text" },
        code: { label: "Código", type: "text" },
        name: { label: "Nome", type: "text" },
      },
      async authorize(credentials) {
        const phone = String(credentials?.phone || "").trim();
        const code = String(credentials?.code || "").trim();
        const name = String(credentials?.name || "").trim();
        if (!phone || code !== DEV_OTP) return null;

        let user = await prisma.user.findUnique({ where: { phone } });
        if (!user) {
          user = await prisma.user.create({
            data: { phone, name: name || "Cliente Boraqui", role: "CUSTOMER" },
          });
        }
        return {
          id: user.id,
          name: user.name,
          email: user.email ?? undefined,
          image: user.image ?? undefined,
          role: user.role as UserRole,
          phone: user.phone,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const email = user.email;
        if (!email) return false;
        const existing = await prisma.user.findUnique({ where: { email } });
        if (!existing) {
          await prisma.user.create({
            data: {
              email,
              name: user.name || "Cliente Boraqui",
              image: user.image,
              role: "CUSTOMER",
            },
          });
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role as UserRole;
        token.phone = user.phone;
        if (account?.provider !== "google") token.uid = user.id;
      }
      if (!token.uid) {
        const dbUser = token.email
          ? await prisma.user.findUnique({ where: { email: token.email } })
          : token.phone
            ? await prisma.user.findUnique({ where: { phone: token.phone } })
            : null;
        if (dbUser) {
          token.uid = dbUser.id;
          token.role = dbUser.role as UserRole;
          token.phone = dbUser.phone;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.uid) {
        session.user.id = token.uid;
        session.user.role = token.role ?? "CUSTOMER";
        session.user.phone = token.phone;
      }
      return session;
    },
  },
});
