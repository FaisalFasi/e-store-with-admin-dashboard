/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Custom colors for light and dark modes
        light: {
          bg: "bg-white", // Light background color
          text: "text-gray-300", // Light text color
        },
        dark: {
          bg: "bg-gray-800", // Dark background color (gray-700)
          text: "text-emerald-300", // Light text color for dark mode (gray-300)
        },
      },
      // Extend the typography settings for easier management
      textColor: {
        "light-text": "text-gray-300", // Light mode text color
        "dark-text": "text-emerald-300", // Dark mode text color
      },
      backgroundColor: {
        "light-bg": "#ffffff", // Light mode background color
        "dark-bg": "bg-gray-800", // Dark mode background color
      },
    },
  },
  plugins: [],
};
