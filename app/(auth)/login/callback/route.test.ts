import { cookies } from "next/headers";
import { RedirectType, redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { Mock, describe, expect, test } from "vitest";
import { getRedisInstance } from "../../../lib/test-utils/session";
import { server } from "../../../mocks";
import { githubApiHandlers } from "../../mocks";
import { GET } from "./route";

const cookiesMock = cookies() as unknown as {
  get: Mock;
  set: Mock;
};

function prepareSessionHasState() {
  const DUMMY_SESSION_ID = "DUMMY_SESSION_ID";
  const DUMMY_STATE = "DUMMY_STATE";

  cookiesMock.get.mockReturnValue({ value: DUMMY_SESSION_ID });
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
  test("stateパラメータがセッションの値と不一致時にエラー", () => {
    // Arrange
    const { state } = prepareSessionHasState();
    const DUMMY_STATE = `${state}__NO_NEED_PREFIX`;
    const request = new NextRequest(
      `http://localhost:3000/auth/github/callback?code=123&state=${DUMMY_STATE}`,
    );
    // Act
    const responsePromise = GET(request);
    // Assert
    expect(responsePromise).rejects.toThrow("CSRF Token not equaled.");
  });

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
    expect(redirect).toBeCalledTimes(1);
    expect(redirect).toBeCalledWith("/user", RedirectType.replace);
  });
});
