import type { Config } from "tailwindcss"

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#f4ecd6",
        ink: "#0e3870",
        accent: "#e8576b",
      },
      fontFamily: {
        display: ['"Rubik Mono One"', "sans-serif"],
        body: ["Rubik", "sans-serif"],
      },
      maxWidth: {
        mobile: "440px",
      },
    },
  },
  plugins: [],
}
export default config
