/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          dark: '#60A5FA',
        },
        text: {
          DEFAULT: '#1F2937',
          dark: '#E5E7EB',
        },
        bg: {
          DEFAULT: '#FFFFFF',
          dark: '#111827',
        },
        page: {
          DEFAULT: '#F9FAFB',
          dark: '#111827',
        },
      },
      maxWidth: {
        content: '1200px',
        article: '720px',
      },
      fontFamily: {
        sans: ['Inter', 'LXGW WenKai', 'system-ui', 'sans-serif'],
        serif: ['LXGW WenKai', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        lxgw: ['LXGW WenKai', 'system-ui', 'sans-serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '720px',
            color: '#1F2937',
            a: {
              color: '#2563EB',
              '&:hover': {
                color: '#1D4ED8',
              },
            },
            'h1, h2, h3, h4': {
              color: '#111827',
            },
            code: {
              color: '#E11D48',
              backgroundColor: '#F3F4F6',
              padding: '0.2em 0.4em',
              borderRadius: '0.25rem',
              fontWeight: '400',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            pre: {
              backgroundColor: '#1F2937',
              color: '#E5E7EB',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
