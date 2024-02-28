"use server";

import { redirect } from "next/navigation";
import { getMutableSession } from "./lib/session";

export async function login() {
  const mutableSession = await getMutableSession();
  const state = await mutableSession.preLogin();

  redirect(
    `https://github.com/login/oauth/authorize?scope=user:email&client_id=${process.env.GITHUB_CLIENT_ID}&state=${state}`,
  );
}
