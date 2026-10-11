/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#F6F8FB',
        surface: {
          DEFAULT: '#FFFFFF',
          subtle: '#F0F4F8',
        },
        brand: {
          50: '#F0F4F8',
          100: '#D9E2EC',
          200: '#BCCCDC',
          300: '#9FB3C8',
          400: '#829AB1',
          500: '#627D98',
          600: '#486581',
          700: '#234C7A', // Primary interactive action / focus ring (8.80:1 AAA)
          800: '#1C3B5E',
          900: '#172C49', // Operational Navy structural header (13.22:1 AAA)
          950: '#0D1929',
        },
        ink: {
          primary: '#202B3C',   // 14.26:1 contrast AAA
          secondary: '#526174', // 6.32:1 contrast AA
          muted: '#7B8A9E',
        },
        border: {
          subtle: '#DCE3EC',
          input: '#94A3B8',
          focus: '#234C7A',
        },
        status: {
          booked: {
            bg: '#EEF1F5',
            text: '#465466',
            border: '#D5DCE4',
          },
          transit: {
            bg: '#EAF2FC',
            text: '#245A91',
            border: '#BFD6F6',
          },
          hold: {
            bg: '#FFF3D6',
            text: '#805500',
            border: '#F6D884',
          },
          delivered: {
            bg: '#E8F5ED',
            text: '#216E45',
            border: '#B7E4CA',
          },
          danger: {
            bg: '#FCECEC',
            text: '#A12A2A',
            border: '#F7BDBD',
          },
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          'sans-serif',
        ],
        mono: [
          '"JetBrains Mono"',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
    },
  },
  plugins: [],
};
