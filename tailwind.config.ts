import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["var(--font-sans)"],
                mono: ["var(--font-mono)"],
            },
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                primary: {
                    DEFAULT: "#6366f1", // Indigo 500
                    foreground: "#ffffff",
                },
                secondary: {
                    DEFAULT: "#ec4899", // Pink 500
                    foreground: "#ffffff",
                },
                accent: {
                    DEFAULT: "#8b5cf6", // Violet 500
                    foreground: "#ffffff",
                },
            },
            animation: {
                "fade-in-up": "fadeInUp 0.5s ease-out forwards",
                "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                "float": "float 6s ease-in-out infinite",
                "tilt": "tilt 10s infinite linear",
                "marquee": "marquee 25s linear infinite",
            },
            keyframes: {
                fadeInUp: {
                    "0%": { opacity: "0", transform: "translateY(20px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                float: {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-20px)" },
                },
                tilt: {
                    "0%, 50%, 100%": { transform: "rotate(0deg)" },
                    "25%": { transform: "rotate(1deg)" },
                    "75%": { transform: "rotate(-1deg)" },
                },
                marquee: {
                    from: { transform: "translateX(0)" },
                    to: { transform: "translateX(-100%)" },
                },
            },
        },
    },
    plugins: [],
};
export default config;
