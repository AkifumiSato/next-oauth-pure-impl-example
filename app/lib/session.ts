import Redis from "ioredis";
import { cookies } from "next/headers";
import { v4 as uuid } from "uuid";

const SESSION_COOKIE_NAME = "sessionId";

export const redisStore = new Redis({
  enableAutoPipelining: true,
});

type PersistedSession = {
  currentUser:
    | {
        isLogin: false;
        state?: string;
      }
    | {
        isLogin: true;
        accessToken: string;
      };
};

class MutableSession {
  private readonly values: PersistedSession;

  constructor(values?: PersistedSession) {
    this.values = values ?? { currentUser: { isLogin: false } };
  }

  get currentUser() {
    return this.values.currentUser;
  }

  async preLogin() {
    const state = uuid();
    this.values.currentUser = { isLogin: false, state };
    await this.save();

    return state;
  }

  async onLogin(accessToken: string) {
    this.values.currentUser = { isLogin: true, accessToken };
    await this.save();
  }

  async onLogout() {
    this.values.currentUser = { isLogin: false };
    await this.save();
  }

  private async save(): Promise<void> {
    const sessionIdFromCookie = cookies().get(SESSION_COOKIE_NAME)?.value;
    let sessionId: string;
    if (sessionIdFromCookie) {
      sessionId = sessionIdFromCookie;
    } else {
      sessionId = uuid();
      cookies().set(SESSION_COOKIE_NAME, sessionId, {
        httpOnly: true,
        // secure: true,
        sameSite: "lax",
      });
    }
    await redisStore.set(sessionId, JSON.stringify(this.values));
  }
}

export async function getMutableSession(): Promise<MutableSession> {
  const sessionIdFromCookie = cookies().get(SESSION_COOKIE_NAME)?.value;
  const session = sessionIdFromCookie
    ? await redisStore.get(sessionIdFromCookie)
    : null;
  if (session) {
    return new MutableSession(JSON.parse(session) as PersistedSession);
  }
  return new MutableSession();
}

// readonly session
export async function getReadonlySession(): Promise<
  Readonly<PersistedSession>
> {
  const sessionIdFromCookie = cookies().get(SESSION_COOKIE_NAME)?.value;
  const session = sessionIdFromCookie
    ? await redisStore.get(sessionIdFromCookie)
    : null;
  if (session) {
    return JSON.parse(session) as PersistedSession;
  }
  return { currentUser: { isLogin: false } };
}
