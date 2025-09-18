import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx,md,mdx}",
    "./src/components/**/*.{ts,tsx,md,mdx}",
    "./src/lib/**/*.{ts,tsx,md,mdx}",
  ],
  plugins: [],
};

export default config;
