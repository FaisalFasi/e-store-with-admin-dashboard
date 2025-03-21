import React from "react";
import { Toaster } from "react-hot-toast";
import Navbar from "../shared/Navbar/Navbar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="relative min-h-screen">
      <div className="relative z-50 ">
        <Navbar />
        <Outlet />
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
};

export default Layout;
