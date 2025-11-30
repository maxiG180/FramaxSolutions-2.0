import { useEffect, useState } from "react";

const KONAMI_CODE = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "b",
    "a",
];

export function useKonamiCode() {
    const [input, setInput] = useState<string[]>([]);
    const [triggered, setTriggered] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const newInput = [...input, e.key];
            if (newInput.length > KONAMI_CODE.length) {
                newInput.shift();
            }
            setInput(newInput);

            if (newInput.join("") === KONAMI_CODE.join("")) {
                setTriggered(true);
                setInput([]);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [input]);

    return triggered;
}
