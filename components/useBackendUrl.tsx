export const BASE_URL =
  process.env.NEXT_PUBLIC_MODE === "true"
    ? process.env.NEXT_PUBLIC_BACKEND_URL
    : "http://localhost:8000/";