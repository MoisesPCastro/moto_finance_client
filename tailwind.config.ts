import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Cores da Uber (preto) e 99/Pop (amarelo)
        'uber-black': '#000000',
        'uber-gray': '#1F1F1F',
        '99-yellow': '#FFC107',
        '99-orange': '#FF9800',
        'pop-yellow': '#FFD700',
        'pop-orange': '#FF8C00',

        // Cores personalizadas do app
        primary: {
          DEFAULT: '#FFC107', // Amarelo 99
          dark: '#FF9800',
          light: '#FFD700',
        },
        secondary: {
          DEFAULT: '#000000', // Preto Uber
          light: '#1F1F1F',
        },
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        info: '#3B82F6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
