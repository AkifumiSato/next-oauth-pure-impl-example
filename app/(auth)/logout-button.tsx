import { RedirectType, redirect } from "next/navigation";
import { getMutableSession } from "../lib/session";

export async function logout() {
  "use server";

  const mutableSession = await getMutableSession();
  await mutableSession.onLogout();

  redirect("/", RedirectType.replace);
}

export function LogoutButton({ children }: { children: React.ReactNode }) {
  return (
    <form action={logout}>
      <button type="submit">{children}</button>
    </form>
  );
}
