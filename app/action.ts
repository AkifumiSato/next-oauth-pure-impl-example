"use server";

import { redirect } from "next/navigation";
import { getSession } from "./lib/session";

export async function login() {
  const session = await getSession();
  const state = await session.preLogin();

  redirect(
    `https://github.com/login/oauth/authorize?scope=user:email&client_id=${process.env.GITHUB_CLIENT_ID}&state=${state}`,
  );
}
