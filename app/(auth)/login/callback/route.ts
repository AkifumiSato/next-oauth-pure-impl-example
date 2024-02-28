import { RedirectType, redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { getMutableSession } from "../../../lib/session";

type GithubAccessTokenResponse = {
  access_token: string;
  token_type: string;
  scope: string;
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mutableSession = await getMutableSession();
  if (mutableSession.currentUser.isLogin === true) {
    throw new Error("Already login.");
  }

  // check state(csrf token)
  const urlState = searchParams.get("state");
  if (mutableSession.currentUser.state !== urlState) {
    console.error("CSRF Token", mutableSession.currentUser.state, urlState);
    throw new Error("CSRF Token not equaled.");
  }

  const code = searchParams.get("code");
  const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = process.env;
  if (GITHUB_CLIENT_ID === undefined || GITHUB_CLIENT_SECRET === undefined) {
    throw new Error("GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET is not defined");
  }

  const githubTokenResponse: GithubAccessTokenResponse = await fetch(
    `https://github.com/login/oauth/access_token?client_id=${GITHUB_CLIENT_ID}&client_secret=${GITHUB_CLIENT_SECRET}&code=${code}`,
    {
      method: "GET",
      headers: {
        Accept: " application/json",
      },
    },
  ).then((res) => {
    if (!res.ok) throw new Error("failed to get access token");
    return res.json();
  });

  await mutableSession.onLogin(githubTokenResponse.access_token);

  redirect("/user", RedirectType.replace);
}
