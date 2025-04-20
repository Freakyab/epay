export const BASE_URL =
  process.env.NODE_ENV_ === "production"
    ? process.env.NEXT_PUBLIC_BACKEND_URL
    : "http://localhost:8000/";