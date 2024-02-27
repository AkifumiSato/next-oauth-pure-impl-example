import { redirect } from "next/navigation";
import { getSession } from "./lib/session";

export default function Page() {
  async function login() {
    "use server";

    const session = await getSession();
    const state = await session.preLogin();

    redirect(
      `https://github.com/login/oauth/authorize?scope=user:email&client_id=${process.env.GITHUB_CLIENT_ID}&state=${state}`,
    );
  }

  return (
    <>
      <h1>Hello, Github OAuth App!</h1>
      <form action={login}>
        <button type="submit">Github OAuth</button>
      </form>
    </>
  );
}

export const metadata = {
  title: "Hello, Github OAuth App!",
};

export const dynamic = "force-dynamic";
