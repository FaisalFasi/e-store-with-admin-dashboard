import React from "react";
import Layout from "../Layout/Layout";
import AppRoutes from "../AppRoutes/AppRoutes";
import Navbar from "../shared/Navbar/Navbar";

const _app = () => {
  return (
    <Layout>
      <Navbar />
      <AppRoutes />
    </Layout>
  );
};

export default _app;
