/** @type {import('tailwindcss').Config} */
// Ensuring dark mode is configured correctly
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {},
    },
    plugins: [],
}
