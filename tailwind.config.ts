import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      boxShadow: {
        '3xl': '0 0 200px 0px rgba(0, 0, 0, 0.1)',
        box: '5px 5px 0 #222',
        "3s": '3px 3px 0 #222',
        "2s": '2px 2px 0 #222',
        button: '0 0 10px rgba(255,255,255,0.1)'
      },
      colors:{
        "primary-blue-100": "#03001D",
        "primary-blue-200": "#0D0C4D",
        "primary-blue-300": "#0204FD",
        "primary-gray-50": "#808080",
        "primary-gray-100": "#1E2A44",
        "primary-gray-200": "#141823",
        "primary-gray-300": "#0E1119",
      }
    },
  },
  plugins: [],
};
export default config;
