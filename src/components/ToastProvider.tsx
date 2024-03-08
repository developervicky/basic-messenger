import { FC } from "react";
import { Toaster } from "react-hot-toast";

interface ToastProviderProps {
  children: React.ReactNode;
}

const ToastProvider: FC<ToastProviderProps> = ({ children }) => {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      {children}
    </>
  );
};

export default ToastProvider;
