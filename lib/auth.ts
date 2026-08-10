import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import User from "@/models/User";
import connectDB from "@/lib/mongodb";

import bcrypt from "bcryptjs";


export const authOptions: NextAuthOptions = {


  providers: [

    CredentialsProvider({

      name: "Credentials",

      credentials: {

        email: {
          label: "Email",
          type: "text"
        },

        password: {
          label: "Password",
          type: "password"
        }

      },


      async authorize(credentials) {


        if (
          !credentials?.email ||
          !credentials?.password
        ) {

          return null;

        }



        await connectDB();



        const user =
          await User.findOne({

            email: credentials.email.toLowerCase()

          });



        if (!user) {

          return null;

        }



        const isValid =
          await bcrypt.compare(
            credentials.password,
            user.password
          );



        if (!isValid) {

          return null;

        }



        return {

          id: user._id.toString(),

          name: user.name,

          email: user.email,

          role: user.role

        };


      }


    })

  ],





  session: {

    strategy: "jwt"

  },





  callbacks: {


    async jwt({ token, user }) {


      if (user) {

        token.id = user.id;

        token.role = user.role;

      }


      return token;

    },





    async session({ session, token }) {


      if (session.user) {


        session.user.id =
          token.id as string;


        session.user.role =
          token.role as string;


      }


      return session;

    }


  }



};