/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        surface: "#0b0e14",
        panel: "#12161f",
        "border-subtle": "#1e2530",
        muted: "#94a3b8",
      },
      gridTemplateColumns: {
        100: "repeat(100, minmax(0, 1fr))",
      },
    },
  },
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  daisyui: {
    themes: [
      {
        bbbexchange: {
          primary: "#22c55e",
          "primary-content": "#020617",
          secondary: "#1e293b",
          "secondary-content": "#e2e8f0",
          accent: "#38bdf8",
          "accent-content": "#020617",
          neutral: "#0f172a",
          "neutral-content": "#e2e8f0",
          "base-100": "#0b0e14",
          "base-200": "#12161f",
          "base-300": "#1a2030",
          "base-content": "#e5e7eb",
          info: "#38bdf8",
          success: "#22c55e",
          warning: "#f59e0b",
          error: "#ef4444",
        },
      },
    ],
  },
  plugins: [require("daisyui")],
};
