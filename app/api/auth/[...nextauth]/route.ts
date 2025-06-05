// app/api/auth/[...nextauth]/route.ts
export const dynamic = 'force-dynamic';
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/authOptions';

// 👇 This line is necessary for App Router API routes using dynamic parameters

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
