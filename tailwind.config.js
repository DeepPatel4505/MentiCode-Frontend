/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ============================================
      // COLORS - Extracted from GlobalLayout.css + analyze.css
      // ============================================
      colors: {
        // Layout Shell Tokens
        bg: {
          page: '#141414',
          navbar: '#1f1f1f',
          sidebar: '#1a1a1a',
          content: '#171717',
          elevated: '#262626',
        },
        text: {
          primary: '#e9e9e9',
          muted: '#a4a4a4',
          light: '#f4f4f4',
          lighter: '#f5f5f5',
          white: '#f0f0f0',
          white5: '#f2f2f2',
          white3: '#fff5e3',
        },
        border: {
          DEFAULT: '#2f2f2f',
          light: '#323232',
          lighter: '#353535',
          nav: '#323232',
          toggle: '#4a4a4a',
          divider: '#1f2937',
        },
        active: '#f3a42d', // accent amber
        accent: {
          amber: '#f3a42d',
          amber_light: '#ffb95e',
          amber_dark: '#ff8f3d',
          orange: '#ff9d3a',
          cyan: '#22d3ee',
        },

        // Feature/Analyze Tokens (Blue-gray palette)
        blue: {
          50: '#f8fafc',
          100: '#f1f5f9',
          900: '#0f172a',
          950: '#020617',
        },
        slate: {
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b', // analyze-bg
          900: '#0f172a',
        },

        // Analyze Feature - Detailed color palette
        'analyze-bg': 'rgba(14, 19, 28, 0.85)',
        'analyze-bg-dark': '#0c1119',
        'analyze-border': '#2c3341',
        'analyze-border-light': '#3a4658',
        'analyze-border-focus': '#87a2c6',
        'analyze-text': '#f0f4fb',
        'analyze-text-light': '#eef3fb',
        'analyze-text-lighter': '#f4f8ff',

        // Repo Card colors
        'repo-border': '#465870',
        'repo-border-hover': '#627a99',
        'repo-border-expanded': '#7e97b8',
        'repo-bg': 'rgba(13, 18, 25, 0.92)',
        'repo-bg-hover': 'rgba(16, 22, 31, 0.95)',
        'repo-title': '#eef3fb',
        'repo-arrow': '#b7c7db',
        'repo-arrow-expanded': '#e6eefb',
        'repo-lang-border': '#8095b2',
        'repo-meta-label': '#9eb2ca',
        'repo-meta-value': '#ecf3fc',

        // Button colors
        'button-primary-bg': 'linear-gradient(120deg, #ffb95e, #ff8f3d)',
        'button-ghost-border': '#3f4a5b',
        'button-ghost-bg': 'rgba(66, 80, 99, 0.2)',
        'run-button-border': '#ff9d3a',
        'run-button-text': '#ffe3c1',
        'run-button-bg': 'rgba(255, 157, 58, 0.15)',

        // Search/Input colors
        'input-border': '#4c5b70',
        'input-border-focus': '#87a2c6',
        'input-bg': 'rgba(14, 18, 25, 0.88)',
        'input-text': '#eef3fb',
        'input-placeholder': '#9db1ca',

        // Scrollbar colors
        'scrollbar': '#3f4f63',
        'scrollbar-analyzer': '#39475c',

        // Responsive colors (mobile)
        'resize-handle-gradient': 'rgba(243, 164, 45, 0.35)',
        'hover-subtle': '#2c2c2c',
        'sidebar-active-bg': 'rgba(243, 164, 45, 0.22)',
        'sidebar-active-bg-light': 'rgba(243, 164, 45, 0.08)',
        'toggle-border': '#6b6b6b',
        'toggle-shadow': 'rgba(243, 164, 45, 0.28)',
      },

      // ============================================
      // FONTS
      // ============================================
      fontFamily: {
        sans: ['Inter', 'Manrope', 'Segoe UI', 'sans-serif'],
        manrope: ['Manrope', 'Segoe UI', 'sans-serif'],
        heading: ['Space Grotesk', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },

      // ============================================
      // SPACING - Using Tailwind defaults (rem-based)
      // ============================================
      spacing: {
        // Already have default spacing, extend as needed
        'navbar-height': '56px',
        'sidebar-default': '260px',
        'sidebar-compact': '220px',
      },

      // ============================================
      // DIMENSIONS
      // ============================================
      width: {
        'card-narrow': '233px',
        'toggle-size': '22px',
      },

      height: {
        'card-narrow': '160px',
        'navbar': '56px',
      },

      maxWidth: {
        'analyze-home': '760px',
        'repo-list': '1100px',
        'analyze-breakpoint': '1120px',
      },

      // ============================================
      // BORDER RADIUS
      // ============================================
      borderRadius: {
        'full-round': '999px',
        'lg-radius': '16px',
        'md-radius': '14px',
        'sm-radius': '10px',
        'xs-radius': '8px',
        'badge': '7px',
      },

      // ============================================
      // SHADOWS
      // ============================================
      boxShadow: {
        'toggle': '0 4px 14px rgba(0, 0, 0, 0.35)',
        'toggle-hover': '0 6px 16px rgba(0, 0, 0, 0.45), 0 0 8px rgba(243, 164, 45, 0.28)',
        'card-hover': '0 8px 18px rgba(6, 11, 18, 0.4)',
        'input-focus': '0 0 0 2px rgba(135, 162, 198, 0.22)',
        // Modern depth shadows
        'card-sm': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'card-md': '0 4px 12px rgba(0, 0, 0, 0.2)',
        'card-lg': '0 8px 24px rgba(0, 0, 0, 0.3)',
        'card-elevated': '0 8px 24px rgba(6, 11, 18, 0.3)',
        'card-glow': '0 0 20px rgba(135, 162, 198, 0.15)',
        'focus-ring': '0 0 0 3px rgba(135, 162, 198, 0.15)',
      },

      // ============================================
      // ANIMATIONS & KEYFRAMES
      // ============================================
      keyframes: {
        repoSkeleton: {
          '0%': { backgroundPosition: '100% 0' },
          '100%': { backgroundPosition: '0 0' },
        },
        cardhover: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.008)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateY(-4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'repo-skeleton': 'repoSkeleton 1.2s ease infinite',
        'card-hover': 'cardhover 0.18s ease',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
      },

      // ============================================
      // TRANSITIONS & DURATIONS
      // ============================================
      transitionDuration: {
        'ultra-fast': '150ms',
        'fast': '200ms',
        'base': '260ms',
        'slow': '350ms',
        'slower': '500ms',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },

      // ============================================
      // TRANSFORM & SCALE
      // ============================================
      scale: {
        '100.8': '1.008',
        '106': '1.06',
      },

      // ============================================
      // LETTER SPACING
      // ============================================
      letterSpacing: {
        'tight': '-0.01em',
        'normal': '0em',
        'uppercase': '0.08em',
        'tracking-04': '0.04em',
      },

      // ============================================
      // FONT SIZES (for headings with clamp)
      // ============================================
      fontSize: {
        'eyebrow': '12px',
        'badge': '11px',
        'sm-text': '13px',
        'base-text': '14px',
        'lg-text': '15px',
        'heading-base': '18px',
        'heading-lg': '20px',
        'heading-xl': '24px',
        'heading-2xl': 'clamp(26px, 2.5vw, 38px)',
        'heading-3xl': 'clamp(30px, 2.2vw, 40px)',
      },

      // ============================================
      // LINE HEIGHT
      // ============================================
      lineHeight: {
        'tight': '1.05',
        'snug': '1.2',
        'normal': '1.5',
      },

      // ============================================
      // Z-INDEX
      // ============================================
      zIndex: {
        'nav': '20',
        'toggle': '7',
        'resize': '3',
      },

      // ============================================
      // GRID TEMPLATES
      // ============================================
      gridTemplateColumns: {
        'layout': 'var(--sidebar-width) minmax(0, 1fr)',
        'layout-full': '1fr',
        'analyze': 'minmax(0, 1.3fr) minmax(0, 1fr)',
        'meta': '1fr 1fr',
      },

      gridTemplateRows: {
        'shell': 'auto minmax(0, 1fr)',
        'navbar-shell': '56px minmax(0, 1fr)',
      },

      // ============================================
      // CUSTOM BACKGROUNDS (for gradients)
      // ============================================
      backgroundImage: {
        'navbar-gradient': 'linear-gradient(90deg, #1f1f1f, #232323)',
        'button-primary': 'linear-gradient(120deg, #ffb95e, #ff8f3d)',
        'sidebar-active': 'linear-gradient(90deg, rgba(243, 164, 45, 0.22), rgba(243, 164, 45, 0.08))',
        'skeleton-shimmer': 'linear-gradient(90deg, rgba(26, 33, 46, 0.9) 25%, rgba(50, 62, 81, 0.9) 37%, rgba(26, 33, 46, 0.9) 63%)',
        'resize-gradient': 'linear-gradient(180deg, rgba(243, 164, 45, 0.35), rgba(243, 164, 45, 0.35))',
      },

      backgroundSize: {
        'skeleton': '400% 100%',
      },

      // ============================================
      // FILTERS & EFFECTS
      // ============================================
      backdropFilter: {
        'blur-sm': 'blur(4px)',
      },
    },
  },

  plugins: [],
};
