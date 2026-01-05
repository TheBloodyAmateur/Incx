/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
            },
            colors: {
                zinc: {
                    850: '#1f1f22',
                    950: '#09090b',
                }
            },
            animation: {
                'fade-in': 'fadeIn 1s ease-out',
                'slide-up': 'slideUp 1s ease-out',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'shake-wind': 'shake-wind 0.5s ease-in-out infinite',
                'wind-fly': 'wind-fly linear infinite',
                'fall': 'fall linear infinite',
                'fall-slow': 'fall linear infinite',
                'flash': 'flash 3s infinite',
                'fog-drift': 'fog-drift 20s linear infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                fall: {
                    '0%': { transform: 'translateY(-10vh)' },
                    '100%': { transform: 'translateY(120vh)' },
                },
                'shake-wind': {
                    '0%': { transform: 'translate(1px, 1px)' },
                    '50%': { transform: 'translate(-1px, 2px)' },
                    '100%': { transform: 'translate(1px, -2px)' },
                },
                'wind-fly': {
                    '0%': { transform: 'translateX(-20vw)', opacity: '0' },
                    '20%': { opacity: '0.6' },
                    '100%': { transform: 'translateX(120vw)', opacity: '0' },
                },
                'fog-drift': {
                    '0%': { transform: 'translateX(-5%)' },
                    '50%': { transform: 'translateX(5%)' },
                    '100%': { transform: 'translateX(-5%)' },
                },
                flash: {
                    '0%, 100%': { opacity: '0' },
                    '5%': { opacity: '0.8' },
                    '10%': { opacity: '0' },
                }
            }
        },
    },
    plugins: [],
}