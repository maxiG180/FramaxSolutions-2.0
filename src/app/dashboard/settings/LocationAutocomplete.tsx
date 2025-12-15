"use client";

import { useState, useRef, useEffect } from "react";
import { MapPin, Search, Check } from "lucide-react";

// Popular tech hubs and major cities
const CITIES = [
    "Amsterdam, NL", "Austin, USA", "Barcelona, ES", "Berlin, DE", "Boston, USA",
    "Brussels, BE", "Chicago, USA", "Copenhagen, DK", "Dublin, IE", "Dubai, UAE",
    "Eindhoven, NL", "Helsinki, FI", "Hong Kong, HK", "Lisbon, PT", "London, UK",
    "Los Angeles, USA", "Madrid, ES", "Melbourne, AU", "Miami, USA", "Milan, IT",
    "Montreal, CA", "Munich, DE", "New York, USA", "Oslo, NO", "Paris, FR",
    "Porto, PT", "Prague, CZ", "Rome, IT", "San Francisco, USA", "Seattle, USA",
    "Seoul, KR", "Singapore, SG", "Stockholm, SE", "Sydney, AU", "Tel Aviv, IL",
    "Tokyo, JP", "Toronto, CA", "Vancouver, CA", "Vienna, AT", "Warsaw, PL", "Zurich, CH"
];

interface LocationAutocompleteProps {
    defaultValue?: string;
    name?: string;
}

export function LocationAutocomplete({ defaultValue = "", name = "location" }: LocationAutocompleteProps) {
    const [value, setValue] = useState(defaultValue);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setValue(defaultValue);
    }, [defaultValue]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredCities = CITIES.filter(city =>
        city.toLowerCase().includes(value.toLowerCase())
    );

    return (
        <div className="relative" ref={wrapperRef}>
            <div className="relative">
                <input
                    type="text"
                    name={name}
                    value={value}
                    onChange={(e) => {
                        setValue(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder="e.g. Lisbon, PT"
                    className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 pl-10 text-white focus:outline-none focus:border-white/30"
                    autoComplete="off"
                />
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            </div>

            {isOpen && (filteredCities.length > 0 || value.length > 0) && (
                <div className="absolute z-50 w-full mt-1 bg-[#1A1A1A] border border-white/10 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    {filteredCities.length > 0 ? (
                        filteredCities.map((city) => (
                            <button
                                key={city}
                                type="button" // Prevent form submission
                                onClick={() => {
                                    setValue(city);
                                    setIsOpen(false);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white flex items-center justify-between group"
                            >
                                <span>{city}</span>
                                {value === city && <Check className="w-3 h-3 text-blue-400" />}
                            </button>
                        ))
                    ) : (
                        <div className="px-4 py-2 text-sm text-white/40">No cities found</div>
                    )}
                </div>
            )}
        </div>
    );
}
