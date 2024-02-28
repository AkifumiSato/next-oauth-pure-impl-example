import { getReadonlySession } from "../../lib/session";
import { GithubUser, NotLogin } from "./presentational";

// Partial type
export type GithubUserResponse = {
  id: number;
  name: string;
  email: string;
};

export default async function Page() {
  const session = await getReadonlySession();
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
