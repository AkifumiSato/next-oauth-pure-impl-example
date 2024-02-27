import { Mock, beforeEach, vi } from "vitest";

const redirectMock = vi.hoisted(() => vi.fn());
export const mockNavigation = (): {
  redirectMock: Mock;
} => {
  vi.mock("next/navigation", async (importOriginal) => {
    return {
      ...(await importOriginal<typeof import("next/navigation")>()),
      redirect: redirectMock,
    };
  });
  return { redirectMock };
};

const getCookiesMock = vi.hoisted(() => vi.fn());
const setCookiesMock = vi.hoisted(() => vi.fn());
export const mockCookies = (): {
  setCookiesMock: Mock;
  getCookiesMock: Mock;
} => {
  vi.mock("next/headers", () => ({
    cookies() {
      return {
        get: getCookiesMock,
        set: setCookiesMock,
      };
    },
  }));

  return { setCookiesMock, getCookiesMock };
};

beforeEach(() => {
  redirectMock.mockClear();
  getCookiesMock.mockClear();
  setCookiesMock.mockClear();
});
