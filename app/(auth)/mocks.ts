import { http, HttpHandler, HttpResponse } from "msw";

export const githubApiHandlers = {
  accessToken: {
    success(): HttpHandler {
      return http.get("https://github.com/login/oauth/access_token", () => {
        return HttpResponse.json({
          access_token: "DUMMY TOKEN",
        });
      });
    },
    error(): HttpHandler {
      return http.get("https://github.com/login/oauth/access_token", () => {
        return HttpResponse.json(
          {
            message: "internal server error",
          },
          { status: 500 },
        );
      });
    },
  },
  user: {
    success(): HttpHandler {
      return http.get("https://api.github.com/user", () => {
        return HttpResponse.json({
          id: 123,
          name: "DUMMY USER",
          email: "test@example.com",
        });
      });
    },
    error(): HttpHandler {
      return http.get("https://api.github.com/user", () => {
        return HttpResponse.json(
          {
            message: "internal server error",
          },
          { status: 500 },
        );
      });
    },
  },
};
