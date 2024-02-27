import { RedirectType, redirect } from "next/navigation";
import { getSession } from "../lib/session";

export function LogoutButton({ children }: { children: React.ReactNode }) {
  async function logout() {
    "use server";

    const session = await getSession();
    await session.onLogout();

    redirect("/", RedirectType.replace);
  }

  return (
    <form action={logout}>
      <button type="submit">{children}</button>
    </form>
  );
}
