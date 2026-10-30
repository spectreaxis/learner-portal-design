import NextAuth from 'next-auth';
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { AUTH_UNAVAILABLE } from '@/lib/auth-errors';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Server-side call to the backend over the internal Docker network
        // (API_URL=http://cogniwise-api:4000/api in production). Browsers use NEXT_PUBLIC_API_URL.
        const API_URL = process.env.API_URL || 'http://api.cogniwiseai.com/api';

        let res: Response;
        try {
          res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });
        } catch (error) {
          // Backend unreachable: report it as an outage, not as bad credentials
          console.error(`Auth error: backend unreachable at ${API_URL}:`, error);
          throw new Error(AUTH_UNAVAILABLE);
        }

        if (res.status >= 500) {
          console.error(`Auth error: backend returned ${res.status} from ${API_URL}/auth/login`);
          throw new Error(AUTH_UNAVAILABLE);
        }

        if (!res.ok) {
          return null;
        }

        const data = await res.json();

        // Return user object with token
        return {
          id: data.learner.id,
          email: data.learner.email,
          name: data.learner.name,
          accessToken: data.token,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Add access token to JWT on sign in
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Add access token to session
      if (session.user) {
        (session as any).accessToken = token.accessToken;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login', // Custom login page (to be created)
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
