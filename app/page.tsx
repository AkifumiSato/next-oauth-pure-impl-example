import { getSession } from "./lib/session";

export default async function Page() {
  const session = await getSession();
  console.log("session", session);

  return <h1>Hello, Next.js!</h1>;
}
