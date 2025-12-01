/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#000033',
        secondary: '#f21b74',
      },
      boxShadow: {
        "custom-inset": '3px 3px 4px rgba(0, 0, 0, 0.25) inset 2px 5px 6px rgba(255, 255, 255, 0.37), inset 0px -5px 6px rgba(0, 0, 0, 0.37)',
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '3rem',
          xl: '4rem',
          '2xl': '6rem',
        },
      },
      fontFamily: {
        body: ['"Poppins"', 'sans-serif'],
      },
      // THÊM PHẦN NÀY: Định nghĩa gradient tùy chỉnh
      backgroundImage: {
        'custom-gradient': 'linear-gradient(to bottom, #6A5ACD, #A020F0, #9932CC)',
      },
      // KẾT THÚC PHẦN THÊM
      keyframes: {
        rocket: {
          "0%, 100%": { transform: 'rotate(-2deg) translate(0px, 0px)' },
          "50%": { transform: 'rotate(2deg) translate(50px, 50px)' },
        },
        twinkle: {
          '0%, 100%': { opacity: 0.3 },
          '50%': { opacity: 0.7 },
        },
        drift: {
          '0%': { transform: 'translateY(0) translateX(0)' },
          '50%': { transform: 'translateY(-10px) translateX(10px)' },
          '100%': { transform: 'translateY(0) translateX(0)' },
        },
      },
      animation: {
        rocket: 'rocket 3s linear infinite',
        twinkle: 'twinkle 5s ease-in-out infinite',
        drift: 'drift 15s ease-in-out infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography')
  ],
}