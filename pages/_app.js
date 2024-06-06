import "../styles/globals.css";
import { themeChange } from "theme-change";
import React from "react";
import Layout from "../components/Layout";

const MyApp = ({ Component, pageProps }) => {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
};

export default MyApp;
