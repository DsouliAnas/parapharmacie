import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "admin@fairys.tn",
        },

        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        /*
         * Never trust data coming from the browser.
         */
        if (
          !credentials ||
          typeof credentials.email !== "string" ||
          typeof credentials.password !== "string"
        ) {
          return null;
        }

        /*
         * Basic size protection.
         *
         * This prevents someone from sending extremely
         * large strings to the authentication endpoint.
         */
        if (
          credentials.email.length > 254 ||
          credentials.password.length > 128
        ) {
          return null;
        }

        const email =
          credentials.email
            .trim()
            .toLowerCase();

        const password =
          credentials.password;

        if (!email || !password) {
          return null;
        }

        /*
         * Basic email validation.
         *
         * This is not intended to replace database validation.
         * It simply rejects obviously malformed input.
         */
        const emailPattern =
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
          return null;
        }

        try {
          await connectDB();

          /*
           * Only retrieve the fields needed for authentication.
           */
          const user = await User.findOne({
            email,
          }).select(
            "_id name email password role"
          );

          /*
           * Deliberately return the same result whether:
           *
           * - the email does not exist
           * - the password is incorrect
           *
           * This prevents simple account enumeration.
           */
          if (!user) {
            return null;
          }

          if (
            typeof user.password !== "string" ||
            !user.password
          ) {
            return null;
          }

          const passwordValid =
            await bcrypt.compare(
              password,
              user.password
            );

          if (!passwordValid) {
            return null;
          }

          /*
           * Only return the information that NextAuth
           * actually needs.
           *
           * NEVER return:
           * - password
           * - password hash
           * - address
           * - phone
           * - other private database fields
           */
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          /*
           * Never expose database/authentication errors
           * to the browser.
           */
          console.error(
            "AUTHENTICATION ERROR:",
            error
          );

          return null;
        }
      },
    }),
  ],

  /*
   * JWT sessions are appropriate for this setup.
   */
  session: {
    strategy: "jwt",
  },

  callbacks: {
    /*
     * JWT
     *
     * Only store the minimum information required
     * by the application.
     */
    async jwt({
      token,
      user,
    }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      return token;
    },

    /*
     * Session
     *
     * Only expose the minimum information required
     * by the frontend.
     */
    async session({
      session,
      token,
    }) {
      if (session.user) {
        if (typeof token.id === "string") {
          session.user.id = token.id;
        }

        if (typeof token.role === "string") {
          session.user.role = token.role;
        }
      }

      return session;
    },
  },

  /*
   * Prevent exposing unnecessary authentication
   * information in the URL.
   */
  pages: {
    signIn: "/login",
  },

  /*
   * Useful during development, but don't enable
   * verbose authentication debugging in production.
   */
  debug: process.env.NODE_ENV === "development",
};