export default function Page() {
  return (
    <>
      <h1>Hello, Github OAuth App!</h1>
      <p>
        <a
          href={`https://github.com/login/oauth/authorize?scope=user:email&client_id=${process.env.GITHUB_CLIENT_ID}`}
        >
          Github OAuth
        </a>
      </p>
    </>
  );
}

export const metadata = {
  title: "Hello, Github OAuth App!",
};
