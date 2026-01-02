/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    // 동적 색상 클래스 보호 (프로덕션 빌드 시 purge 방지)
    {
      pattern: /bg-(indigo|emerald|amber|rose|violet|cyan|pink|lime|orange|teal)-(100)/,
    },
    {
      pattern: /text-(indigo|emerald|amber|rose|violet|cyan|pink|lime|orange|teal)-(600|700)/,
    },
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
