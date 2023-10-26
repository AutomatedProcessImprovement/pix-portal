const backendBaseURL = process.env.BACKEND_BASE_URL!;
export const loginURL = new URL(
  "/api/v1/auth/jwt/login",
  backendBaseURL
).toString();

export const userInfoURL = new URL(
  "/api/v1/users/me",
  backendBaseURL
).toString();

export const projectsURL = new URL(
  "/api/v1/projects",
  backendBaseURL
).toString();
