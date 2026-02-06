import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // TalkToLead Color Palette
        primary: {
          DEFAULT: '#0066FF',
          50: '#E6F0FF',
          100: '#CCE0FF',
          200: '#99C2FF',
          300: '#66A3FF',
          400: '#3385FF',
          500: '#0066FF',
          600: '#0052CC',
          700: '#003D99',
          800: '#002966',
          900: '#001433',
        },
        secondary: {
          DEFAULT: '#00D4AA',
          50: '#E6FBF6',
          100: '#CCF7ED',
          200: '#99EFDB',
          300: '#66E7C9',
          400: '#33DFB7',
          500: '#00D4AA',
          600: '#00AA88',
          700: '#008066',
          800: '#005544',
          900: '#002B22',
        },
        accent: {
          DEFAULT: '#FF6B35',
          50: '#FFF0EB',
          100: '#FFE1D7',
          200: '#FFC3AF',
          300: '#FFA587',
          400: '#FF875F',
          500: '#FF6B35',
          600: '#CC562B',
          700: '#994020',
          800: '#662B15',
          900: '#33150B',
        },
        background: '#F8FAFC',
        foreground: '#1E293B',
        muted: {
          DEFAULT: '#64748B',
          foreground: '#94A3B8',
        },
        border: '#E2E8F0',
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#1E293B',
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#1E293B',
        },
        destructive: {
          DEFAULT: '#EF4444',
          foreground: '#FFFFFF',
        },
        success: {
          DEFAULT: '#22C55E',
          foreground: '#FFFFFF',
        },
        warning: {
          DEFAULT: '#F59E0B',
          foreground: '#FFFFFF',
        },
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
