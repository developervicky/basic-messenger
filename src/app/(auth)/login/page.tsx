"use client";
import Button from "@/components/ui/Button";
import { signIn } from "next-auth/react";
import { FC, useState } from "react";
import toast from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";

interface pageProps {}

const Page: FC<pageProps> = ({}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  async function loginWithGoogle() {
    setIsLoading(true);
    try {
      await signIn("google");
    } catch (error) {
      toast.error(
        "Some error while connecting with Google Provider, check console for detailed issue!"
      );
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ">
        <div className="w-full max-w-md flex flex-col items-center space-y-8">
          <div className="flex flex-col items-center gap-8">
            logo
            <h2 className="mt-6 text-center text-3xl font-bold tracking text-gray-900">
              Sign in to your account
            </h2>
          </div>

          <Button
            isLoading={isLoading}
            type="button"
            className="max-w-sm mx-auto w-full space-x-2 hover:bg-slate-700 hover:text-white"
            onClick={loginWithGoogle}
          >
            {isLoading ? null : <FcGoogle />}
            <span>Google</span>
          </Button>
        </div>
      </div>
    </>
  );
};

export default Page;
