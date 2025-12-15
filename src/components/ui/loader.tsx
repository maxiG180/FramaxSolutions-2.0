"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function Loader() {
    return (
        <div className="flex h-full w-full items-center justify-center p-8 min-h-[50vh]">
            <div className="relative flex flex-col items-center justify-center gap-4">
                <motion.div
                    className="relative w-16 h-16"
                    animate={{
                        opacity: [0.5, 1, 0.5],
                        scale: [0.95, 1.05, 0.95],
                        filter: ["blur(2px)", "blur(0px)", "blur(2px)"]
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <Image
                        src="/logos/framax_icon.png"
                        alt="Loading..."
                        fill
                        className="object-contain"
                        priority
                    />
                </motion.div>
            </div>
        </div>
    );
}
