"use server";

import { BASE_URL} from "@/components/useBackendUrl";

export const fetchUser = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  try {
    if (!email || !password) {
      throw new Error("Invalid credentials");
    }
    const response = await fetch(`${BASE_URL}auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const responseJson = await response.json();
    if (responseJson.status === "error") {
      throw new Error(responseJson.message);
    }
    if (responseJson.data === null) {
      throw new Error("User not found");
    }
    return responseJson;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const createUser = async ({
  email,
  password,
  username,
}: {
  email: string;
  password: string;
  username: string;
}) => {
  try {
    if (!email || !password || !username) {
      throw new Error("Invalid credentials");
    }

    const response = await fetch("${BASE_URL}auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        username,
      }),
    });
    const responseJson = await response.json();
    if (responseJson.status === "error") {
      throw new Error(responseJson.message);
    }
    if (responseJson.data === null) {
      throw new Error("User not found");
    }
    return responseJson;
  } catch (error: any) {
    throw new Error(error.message);
  }
};
