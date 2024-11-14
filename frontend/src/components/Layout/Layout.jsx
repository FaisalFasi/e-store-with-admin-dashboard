import React from "react";
import { Toaster } from "react-hot-toast";

const Layout = ({ children }) => {
  return (
    <div className="relative min-h-screen">
      <div className="relative z-50 ">{children}</div>
      <Toaster position="bottom-right" />
    </div>
  );
};

export default Layout;
