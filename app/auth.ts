import { getServerSession, type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { encode, decode } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import { userServices } from "./services/userServices";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
      },
      async authorize(credentials, req) {
        try {
          if (credentials) {
            const response = await userServices.authenticate({
              email: credentials.email,
              password: credentials.password,
              username: credentials.name,
              googleLogin: false,
            });

            if (response?.user) {
              const { user, error } = response;
              if (error) {
                throw new Error(user.message);
              }
              return { id: user._id, name: user.username, email: user.email, pic: user.picture };
            } else if (response?.error) {
              throw new Error(response.error);
            }
          }
          return null;
        } catch (error: any) {
          throw new Error(error.message || "Authentication failed");
        }
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
  jwt: {
    encode,
    decode,
  },
  callbacks: {
    async jwt({ token, account, profile }) {

      if (account && account.type === "credentials") {
        token.userId = account.providerAccountId;
        // token.pic = account.picture;
        // token.name = account.name as string | null | undefined;
        // token.email = account.email as string | null | undefined;
      }

      if (account && profile) {
        const email = token.email;
        const name = token.name;
        const picture = token.picture;
        if (email && name && picture) {

          const password = email + name + token.userId;

          const response = await userServices.authenticate({
            email,
            username: name,
            password,
            googleLogin: true
          });

          if (response !== undefined && response !== null) {
            token.userId = response.user?._id ?? '';
            token.name = response.user?.username ?? '';
            token.pic = response.user?.picture ?? '';
          }

          else {
            throw new Error("Authentication failed");
          }
        }
      }
      return token;

    },
    async session({ session, token }) {
      session.user.id = token.userId;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

export const getAuthSession = () => getServerSession(authOptions);
