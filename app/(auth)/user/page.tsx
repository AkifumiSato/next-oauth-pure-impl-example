import Link from "next/link";
import { getSession } from "../../lib/session";
import { LogoutButton } from "../logout-button";

// Partial type
type GithubUserResponse = {
  id: number;
  name: string;
  email: string;
};

export function NotLogin() {
  return (
    <>
      <h1>Please Login</h1>
      <Link href="/">top page</Link>
    </>
  );
}

export function GithubUser({ githubUser }: { githubUser: GithubUserResponse }) {
  return (
    <>
      <h1>Github user api response</h1>
      <LogoutButton>logout</LogoutButton>
      <pre>
        <code>{JSON.stringify(githubUser, null, 2)}</code>
      </pre>
    </>
  );
}

export default async function Page() {
  const session = await getSession();
  if (!session.currentUser.isLogin) {
    return <NotLogin />;
  }

  const githubUser: GithubUserResponse = await fetch(
    "https://api.github.com/user",
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.currentUser.accessToken}`,
      },
    },
  ).then(async (res) => {
    if (!res.ok) {
      console.error(res.status, await res.json());
      throw new Error("failed to get github user");
    }
    return res.json();
  });

  return <GithubUser githubUser={githubUser} />;
}

export const metadata = {
  title: "Github User",
};
