import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  
  /* config options here */
  
  devIndicators: false,
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
 
};



export default nextConfig;
