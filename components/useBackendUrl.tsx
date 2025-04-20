export const BASE_URL =
  process.env.NEXT_PUBLIC_MODE 
    ? process.env.NEXT_PUBLIC_BACKEND_URL
    : "http://localhost:8000/";