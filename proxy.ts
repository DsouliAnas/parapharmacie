import { withAuth } from "next-auth/middleware";

export default withAuth(
  function proxy() {
    /*
     * Authorization is handled by the callback below.
     *
     * The proxy itself does not need to modify
     * the request.
     */
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        /*
         * The admin login page must remain publicly
         * accessible.
         */
        if (pathname === "/admin/login") {
          return true;
        }

        /*
         * Every other /admin route requires:
         *
         * 1. A valid NextAuth JWT
         * 2. The admin role
         */
        return (
          typeof token?.id === "string" &&
          token.role === "admin"
        );
      },
    },

    pages: {
      signIn: "/admin/login",
    },
  }
);

export const config = {
  matcher: ["/admin/:path*"],
};