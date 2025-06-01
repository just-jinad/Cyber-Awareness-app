import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized: ({ token }) => {
      return !!token && token?.role === 'ADMIN';
    },
  },
});

export const config = {
  matcher: ['/dashboard/:path*', '/progress/:path*'],
};