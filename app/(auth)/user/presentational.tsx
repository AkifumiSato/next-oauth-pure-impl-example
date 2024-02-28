import Link from "next/link";
import { LogoutButton } from "../logout-button";
import { GithubUserResponse } from "./page";

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
