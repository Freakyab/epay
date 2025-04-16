import { fetchUser, createUser } from "../action";
import { User } from "../type";

export const userServices = {
  authenticate,
};

async function authenticate({
  email,
  username,
  password,
  googleLogin,
}: {
  email: string;
  password: string;
  username: string;
  googleLogin: boolean;
}): Promise<{
  error: string | null;
  user: User | null;
} | null> {
  try {
    if (googleLogin) {

      const response = await fetchUser({ email, password });

      const success = response?.success;
      const user = response?.user;
      const error = response?.message;

      if (!success && error === 'User not found' && !user) {
        const newUser = await createUser({ email, password, username });

        const isNewUserMessage = newUser?.message;

        return {
          user: newUser.user,
          error: isNewUserMessage,
        }
      }

      else {
        if (user === null && user === undefined) {
          throw new Error("Something went wrong");
        }
        else
          return {
            user,
            error
          }
      }

    }

    const isSignUp = username ? true : false;
    
    if (isSignUp) {
  
      const response = await createUser({ email, password, username });

      const success = response?.success;
      const user = response?.user;
      const error = response?.message;

      if (success && user) {
        return {
          user,
          error: null,
        }
      }
      else {
        if (user === null && user === undefined) {
          throw new Error("Something went wrong");
        }
        else
          return {
            user,
            error
          }
      }

    } else {

      const response = await fetchUser({ email, password });

      const success = response?.success;
      const user = response?.user;
      const error = response?.message;

      if (success && user) {
        return {
          user,
          error: null,
        }
      }
      else {
        if (user === null && user === undefined) {
          throw new Error("Something went wrong");
        }
        else
          return {
            user,
            error
          }
      }

    }
  } catch (error: any) {
    return {
      user: null,
      error: error.message,
    };
  }
}
