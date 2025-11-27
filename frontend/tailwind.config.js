export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  safelist: [
    "toast",
    "toast",
    "toast-success",
    "toast-error",
    "show"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0a2a43",
        primaryLight: "#1d4e89",
      }
    },
  },
  plugins: [],
}
