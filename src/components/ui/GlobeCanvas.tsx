"use client";

import { useEffect, useRef } from "react";
import createGlobe from "cobe";

/**
 * Isolated globe component — `cobe` (~80KB WebGL) lives here only.
 * Dynamically imported in Features.tsx so it's NOT in the initial JS bundle.
 * Only downloaded + executed once the Features section scrolls into view.
 */
export function GlobeCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        let phi = 0;
        let width = 0;
        const onResize = () => canvasRef.current && (width = canvasRef.current.offsetWidth);
        window.addEventListener("resize", onResize);
        onResize();

        const globe = createGlobe(canvasRef.current, {
            devicePixelRatio: 1.5,
            width: width * 2,
            height: width * 2,
            phi: 0,
            theta: 0.3,
            dark: 1,
            diffuse: 1.2,
            mapSamples: 10000,
            mapBrightness: 3,
            baseColor: [0.3, 0.3, 0.3],
            markerColor: [0.8, 0.8, 0.8],
            glowColor: [0.5, 0.5, 0.5],
            markers: [],
            onRender: (state) => {
                phi += 0.005;
                state.phi = phi;
                state.width = width * 2;
                state.height = width * 2;
            },
        });

        setTimeout(() => {
            if (canvasRef.current) canvasRef.current.style.opacity = "1";
        });

        return () => {
            globe.destroy();
            window.removeEventListener("resize", onResize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{ opacity: 0, transition: "opacity 0.6s ease", width: "100%", aspectRatio: "1" }}
        />
    );
}
