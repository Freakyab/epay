"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

function Login() {
  const router = useRouter();
  const { status } = useSession();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status]);

  const handleSignup = () => {
    setIsLogin(!isLogin);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    
    const { email, password, name } = formData;

    await signIn("credentials", {
      email,
      password,
      name,
      callbackUrl: "/",
      redirect: false,
    })
    .then((response) => {
      const error = response?.error;
      if (error) {
        toast.error(error);
        console.log(error);
      } else {
        router.push(`/`);
      }
    });
    
    setFormData({ email: "", password: "", name: "" });
    setIsLoading(false);
  };
  return (
    <div className="flex flex-col p-4 h-screen justify-center">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center gap-4 space-y-3">
        <div className="w-full flex-1 rounded-xl border bg-white px-6 pb-4 pt-8 shadow-md md:w-96">
          <h1 className="mb-3 text-2xl font-bold">
            {isLogin ? "Please log in to continue." : "Sign up to get started."}
          </h1>
          <div className="w-full">
            <div>
              <label
                className="mb-3 mt-5 block text-xs font-medium text-zinc-400"
                htmlFor="email">
                Email
              </label>
              <div className="relative">
                <input
                  className="peer block w-full rounded-lg border bg-zinc-50 px-2 py-[9px] text-sm outline-none placeholder:text-zinc-500"
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter your email address"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="mt-4">
              <label
                className="mb-3 mt-5 block text-xs font-medium text-zinc-400"
                htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  className="peer block w-full rounded-lg border bg-zinc-50 px-2 py-[9px] text-sm outline-none placeholder:text-zinc-500"
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Enter password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
              {!isLogin && (
                <>
                  <label
                    className="mb-3 mt-5 block text-xs font-medium text-zinc-400"
                    htmlFor="name">
                    Name
                  </label>
                  <div className="relative">
                    <input
                      className="peer block w-full rounded-lg border bg-zinc-50 px-2 py-[9px] text-sm outline-none placeholder:text-zinc-500"
                      id="name"
                      type="text"
                      name="name"
                      placeholder="Enter your name"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                </>
              )}
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="my-4 flex h-10 w-full flex-row items-center justify-center rounded-lg bg-zinc-900 p-2 text-sm font-semibold text-zinc-100 hover:bg-zinc-800">
            {isLoading && <Loader2 className="animate-spin ml-2" />}
            <span className="text-sm">{isLogin ? "Log in" : "Sign up"}</span>
          </button>
          <button>
            <span
              className="text-sm"
              onClick={() => signIn("google", { callbackUrl: "/" })}>
              Continue with Google
            </span>
          </button>
        </div>
        <div className="flex flex-row gap-1 text-sm text-zinc-400">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <div
            className="font-semibold underline cursor-pointer"
            onClick={handleSignup}>
            {isLogin ? "Sign up" : "Log in"}
          </div>
        </div>
      </form>
    </div>
  );
}

export default Login;
