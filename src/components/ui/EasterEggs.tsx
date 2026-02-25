"use client";

import { useEffect, useRef } from "react";

// Lightweight money emoji that spawns on click and floats up
function spawnMoney(x: number, y: number) {
    const emojis = ["💸", "💰", "🤑", "💵", "✨"];
    const el = document.createElement("div");
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    el.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        font-size: ${Math.random() * 14 + 18}px;
        pointer-events: none;
        z-index: 99999;
        user-select: none;
        transition: none;
        will-change: transform, opacity;
        animation: moneyFloat ${0.8 + Math.random() * 0.6}s ease-out forwards;
        transform-origin: center;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1500);
}

// Cursor sparkle that follows mouse on hero section
function spawnSparkle(x: number, y: number) {
    const el = document.createElement("div");
    const size = Math.random() * 6 + 4;
    const colors = ["#3b82f6", "#60a5fa", "#93c5fd", "#fbbf24", "#a78bfa"];
    el.style.cssText = `
        position: fixed;
        left: ${x - size / 2}px;
        top: ${y - size / 2}px;
        width: ${size}px;
        height: ${size}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        border-radius: 50%;
        pointer-events: none;
        z-index: 99998;
        animation: sparkleOut 0.6s ease-out forwards;
   `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 600);
}

export function EasterEggs() {
    const clickCount = useRef(0);
    const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastSparkle = useRef(0);

    useEffect(() => {
        // Inject keyframe CSS once
        const style = document.createElement("style");
        style.textContent = `
            @keyframes moneyFloat {
                0%   { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
                60%  { transform: translateY(-80px) rotate(${Math.random() > 0.5 ? "" : "-"}${Math.floor(Math.random() * 30 + 10)}deg) scale(1.2); opacity: 0.9; }
                100% { transform: translateY(-140px) rotate(${Math.random() > 0.5 ? "" : "-"}${Math.floor(Math.random() * 20 + 5)}deg) scale(0.8); opacity: 0; }
            }
            @keyframes sparkleOut {
                0%   { transform: scale(1) translate(0, 0); opacity: 0.9; }
                100% { transform: scale(0) translate(${Math.round((Math.random() - 0.5) * 30)}px, ${Math.round((Math.random() - 0.5) * 30)}px); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        return () => style.remove();
    }, []);

    useEffect(() => {
        // Click anywhere — spawn money on every click (not on buttons/links/inputs)
        const handleClick = (e: MouseEvent) => {
            const tag = (e.target as HTMLElement).tagName.toLowerCase();
            if (["button", "a", "input", "textarea", "select"].includes(tag)) return;

            // Spawn 1-3 money emojis with slight offsets
            const count = Math.floor(Math.random() * 2) + 1;
            for (let i = 0; i < count; i++) {
                const offset = (Math.random() - 0.5) * 30;
                setTimeout(() => spawnMoney(e.clientX + offset, e.clientY + offset), i * 80);
            }

            // Triple-click rapid detection → big confetti burst
            clickCount.current++;
            if (clickTimer.current) clearTimeout(clickTimer.current);
            clickTimer.current = setTimeout(() => { clickCount.current = 0; }, 500);

            if (clickCount.current >= 5) {
                clickCount.current = 0;
                import("canvas-confetti").then(({ default: confetti }) => {
                    confetti({
                        particleCount: 120,
                        spread: 100,
                        origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight },
                        colors: ["#22c55e", "#4ade80", "#fbbf24", "#3b82f6", "#a78bfa"],
                        scalar: 1.2,
                    });
                });
            }
        };

        // Cursor sparkle trail — only on hero section, throttled to 60fps
        const handleMouseMove = (e: MouseEvent) => {
            const now = Date.now();
            if (now - lastSparkle.current < 60) return; // ~16fps throttle
            lastSparkle.current = now;

            const hero = document.getElementById("hero");
            if (!hero) return;
            const rect = hero.getBoundingClientRect();
            const inHero = e.clientY >= rect.top && e.clientY <= rect.bottom;
            if (!inHero) return;

            if (Math.random() > 0.5) spawnSparkle(e.clientX, e.clientY);
        };

        document.addEventListener("click", handleClick);
        document.addEventListener("mousemove", handleMouseMove, { passive: true });
        return () => {
            document.removeEventListener("click", handleClick);
            document.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    return null;
}
