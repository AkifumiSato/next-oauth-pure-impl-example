import { RedirectType } from "next/navigation";
import { NextRequest } from "next/server";
import { describe, expect, test } from "vitest";
import { mockCookies, mockNavigation } from "../../../lib/test-utils/next";
import { getRedisInstance } from "../../../lib/test-utils/session";
import { server } from "../../../mocks";
import { githubApiHandlers } from "../../mocks";
import { GET } from "./route";

const { redirectMock } = mockNavigation();
const { getCookiesMock } = mockCookies();

function prepareSessionHasState() {
  const DUMMY_SESSION_ID = "DUMMY_SESSION_ID";
  const DUMMY_STATE = "DUMMY_STATE";

  getCookiesMock.mockReturnValue({ value: DUMMY_SESSION_ID });
  const redis = getRedisInstance();
  redis.set(
    DUMMY_SESSION_ID,
    JSON.stringify({
      currentUser: {
        isLogin: false,
        state: DUMMY_STATE,
      },
    }),
  );

  return {
    redis,
    state: DUMMY_STATE,
    sessionId: DUMMY_SESSION_ID,
  };
}

describe("GET", () => {
  test("access_tokenの取得エラー", async () => {
    // Arrange
    const { state } = prepareSessionHasState();
    server.use(githubApiHandlers.accessToken.error());
    const request = new NextRequest(
      `http://localhost:3000/auth/github/callback?code=123&state=${state}`,
    );
    // Act
    const responsePromise = GET(request);
    // Assert
    await expect(responsePromise).rejects.toThrow("failed to get access token");
  });

  test("access_token取得後`/user`にリダイレクト", async () => {
    // Arrange
    const { redis, state, sessionId } = prepareSessionHasState();
    server.use(
      githubApiHandlers.accessToken.success(),
      githubApiHandlers.user.success(),
    );
    const request = new NextRequest(
      `http://localhost:3000/auth/github/callback?code=123&state=${state}`,
    );
    // Act
    const response = await GET(request);
    // Assert
    expect(response).toBeUndefined();
    const sessionValues = await redis
      .get(sessionId)
      .then((res) => (res === null ? null : JSON.parse(res)));
    expect(sessionValues).toEqual({
      currentUser: {
        isLogin: true,
        accessToken: "DUMMY TOKEN",
      },
    });
    expect(redirectMock).toBeCalledTimes(1);
    expect(redirectMock).toBeCalledWith("/user", RedirectType.replace);
  });
});
