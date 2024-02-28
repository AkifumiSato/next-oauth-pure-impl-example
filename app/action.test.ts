import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Mock, describe, expect, test } from "vitest";
import { login } from "./action";
import { getRedisInstance } from "./lib/test-utils/session";

const cookiesMock = cookies() as unknown as {
  get: Mock;
  set: Mock;
};

describe("login", () => {
  test("sessionにstate tokenが保存されredirectされる", async () => {
    // Arrange
    cookiesMock.get.mockReturnValue({ value: "DUMMY_SESSION_ID" });
    const redis = getRedisInstance();
    // Act
    await login();
    // Assert
    expect(redirect).toBeCalledTimes(1);
    const session = JSON.parse(await redis.get("DUMMY_SESSION_ID"));
    expect(session?.currentUser?.isLogin).toBe(false);
    expect(session?.currentUser?.state).toBeTypeOf("string");
  });
});
