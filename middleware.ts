import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth({
  callbacks: {
    authorized: ({ token }) => {
      if (!token || token?.role !== 'ADMIN') {
        return false;
      }
      return true;
    },
  },
});

export const config = {
  matcher: ['/dashboard/:path*'],
};