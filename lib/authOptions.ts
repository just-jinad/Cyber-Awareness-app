import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const prisma = new PrismaClient();
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Missing credentials');
          }
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });
          if (!user || !(await bcrypt.compare(credentials.password, user.password))) {
            throw new Error('Invalid email or password');
          }
          return { id: user.id, email: user.email, role: user.role, name: user.username };
        } finally {
          await prisma.$disconnect();
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id ? user.id.toString() : undefined; // Convert number to string
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id ? parseInt(token.id) : undefined; // Convert back to number
        session.user.role = token.role as 'USER' | 'ADMIN';
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
};