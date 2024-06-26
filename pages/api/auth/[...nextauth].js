import NextAuth from "next-auth";
import TwitterProvider from "next-auth/providers/twitter";

export const authOptions = {
	// Configure one or more authentication providers
	providers: [
		TwitterProvider({
			clientId: process.env.TWITTER_CLIENT_ID,
			clientSecret: process.env.TWITTER_CLIENT_SECRET,
			version: "2.0", // opt-in to Twitter OAuth 2.0
		}),
		// ...add more providers here
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user?.id) {
				token.id = user.id;
			}
			if (user?.username) {
				token.userName = user.username;
			}
			return token;
		},
		async session({ session, token }) {
			if (token.id) {
				session.user.id = token.id;
			}
			if (token.userName) {
				session.user.userName = token.userName;
			}
			return session;
		},
	},
};

export default NextAuth(authOptions);
