import { login } from "./action";

export default function Page() {
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
