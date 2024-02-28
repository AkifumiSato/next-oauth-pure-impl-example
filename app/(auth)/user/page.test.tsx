import { cookies } from "next/headers";
import { Mock, describe, expect, test, vi } from "vitest";
import { getRedisInstance } from "../../lib/test-utils/session";
import { server } from "../../mocks";
import { githubApiHandlers } from "../mocks";
import Page from "./page";
import { GithubUser, NotLogin } from "./presentational";

const cookiesMock = cookies() as unknown as {
  get: Mock;
  set: Mock;
};

function prepareSession({ isLogin }: { isLogin: boolean }) {
  const redis = getRedisInstance();
  if (!isLogin) {
    return {
      redis,
      sessionId: null,
    };
  }

  const DUMMY_SESSION_ID = "DUMMY_SESSION_ID";
  const DUMMY_ACCESS_TOKEN = "DUMMY_ACCESS_TOKEN";
  cookiesMock.get.mockReturnValue({ value: DUMMY_SESSION_ID });
  redis.set(
    DUMMY_SESSION_ID,
    JSON.stringify({
      currentUser: {
        isLogin: true,
        accessToken: DUMMY_ACCESS_TOKEN,
      },
    }),
  );

  return {
    redis,
    sessionId: DUMMY_SESSION_ID,
  };
}

test("未ログイン時、<NotLogin />", async () => {
  // Arrange
  prepareSession({ isLogin: false });
  // Act
  const { type } = await Page();
  // Assert
  expect(type).toBe(NotLogin);
});

describe("ログイン時", () => {
  test("github user api呼び出し失敗時、エラー", async () => {
    // Arrange
    prepareSession({ isLogin: true });
    server.use(githubApiHandlers.user.error());
    // Act
    const pagePromise = Page();
    // Assert
    expect(pagePromise).rejects.toThrow("failed to get github user");
  });

  test("github user api成功時、<GithubUser />", async () => {
    // Arrange
    prepareSession({ isLogin: true });
    server.use(githubApiHandlers.user.success());
    // Act
    const { type } = await Page();
    // Assert
    expect(type).toBe(GithubUser);
  });
});
