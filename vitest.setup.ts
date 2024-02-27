import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { server } from "./app/mocks";

vi.mock("ioredis", async () => await import("ioredis-mock"));

beforeAll(() =>
  server.listen({
    onUnhandledRequest: "error",
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
