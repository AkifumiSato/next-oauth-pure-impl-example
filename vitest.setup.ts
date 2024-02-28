import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";
import { server } from "./app/mocks";

vi.mock("ioredis", async () => await import("ioredis-mock"));

beforeAll(() =>
  server.listen({
    onUnhandledRequest: "error",
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const cookiesMock = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
}));
vi.mock("next/headers", () => ({
  cookies() {
    return cookiesMock;
  },
}));

const redirectMock = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", async (importOriginal) => {
  return {
    ...(await importOriginal<typeof import("next/navigation")>()),
    redirect: redirectMock,
  };
});

beforeEach(() => {
  cookiesMock.get.mockClear();
  cookiesMock.set.mockClear();
  redirectMock.mockClear();
});
