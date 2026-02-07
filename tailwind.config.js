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
      pattern: /bg-(indigo|emerald|amber|rose|violet|cyan|pink|lime|orange|teal|sky)-(100)/,
    },
    {
      pattern: /text-(indigo|emerald|amber|rose|violet|cyan|pink|lime|orange|teal|sky)-(600|700)/,
    },
    // BoardFilterModal 선택된 게시판 색상 (카테고리별)
    {
      pattern: /bg-(blue|green|gray|indigo|sky|teal)-(500|600)/,
    },
    {
      pattern: /hover:bg-(blue|green|gray|indigo|sky|teal)-(600|700)/,
    },
  ],
  theme: {
    extend: {
      animation: {
        slideDown: 'slideDown 0.3s ease-out',
      },
      keyframes: {
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
