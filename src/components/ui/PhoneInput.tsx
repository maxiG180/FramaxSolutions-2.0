"use client";

import { useState } from "react";
import { Phone, ChevronDown } from "lucide-react";

interface Country {
    code: string;
    name: string;
    dialCode: string;
    flag: string;
}

const countries: Country[] = [
    { code: "PT", name: "Portugal", dialCode: "+351", flag: "🇵🇹" },
    { code: "US", name: "United States", dialCode: "+1", flag: "🇺🇸" },
    { code: "GB", name: "United Kingdom", dialCode: "+44", flag: "🇬🇧" },
    { code: "ES", name: "Spain", dialCode: "+34", flag: "🇪🇸" },
    { code: "FR", name: "France", dialCode: "+33", flag: "🇫🇷" },
    { code: "DE", name: "Germany", dialCode: "+49", flag: "🇩🇪" },
    { code: "IT", name: "Italy", dialCode: "+39", flag: "🇮🇹" },
    { code: "BR", name: "Brazil", dialCode: "+55", flag: "🇧🇷" },
    { code: "CA", name: "Canada", dialCode: "+1", flag: "🇨🇦" },
    { code: "MX", name: "Mexico", dialCode: "+52", flag: "🇲🇽" },
    { code: "AR", name: "Argentina", dialCode: "+54", flag: "🇦🇷" },
    { code: "AU", name: "Australia", dialCode: "+61", flag: "🇦🇺" },
    { code: "IN", name: "India", dialCode: "+91", flag: "🇮🇳" },
    { code: "CN", name: "China", dialCode: "+86", flag: "🇨🇳" },
    { code: "JP", name: "Japan", dialCode: "+81", flag: "🇯🇵" },
    { code: "KR", name: "South Korea", dialCode: "+82", flag: "🇰🇷" },
    { code: "ZA", name: "South Africa", dialCode: "+27", flag: "🇿🇦" },
    { code: "AE", name: "UAE", dialCode: "+971", flag: "🇦🇪" },
    { code: "SA", name: "Saudi Arabia", dialCode: "+966", flag: "🇸🇦" },
    { code: "NL", name: "Netherlands", dialCode: "+31", flag: "🇳🇱" },
];

interface PhoneInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function PhoneInput({ value, onChange, placeholder = "Phone number" }: PhoneInputProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Parse the current value to extract country code and number
    const getSelectedCountry = () => {
        const country = countries.find(c => value.startsWith(c.dialCode));
        return country || countries[0]; // Default to Portugal
    };

    const [selectedCountry, setSelectedCountry] = useState<Country>(getSelectedCountry());

    const getPhoneNumber = () => {
        if (value.startsWith(selectedCountry.dialCode)) {
            return value.slice(selectedCountry.dialCode.length).trim();
        }
        return value;
    };

    // Format phone number with spaces based on country
    const formatPhoneNumber = (number: string, countryCode: string): string => {
        // Remove all spaces and non-digits
        let digitsOnly = number.replace(/\D/g, '');

        // Max lengths per country
        const maxLengths: Record<string, number> = {
            'PT': 9, 'US': 10, 'GB': 10, 'ES': 9, 'FR': 9,
            'DE': 11, 'IT': 10, 'BR': 11, 'CA': 10, 'MX': 10,
            'AR': 10, 'AU': 9, 'IN': 10, 'CN': 11, 'JP': 10,
            'KR': 10, 'ZA': 9, 'AE': 9, 'SA': 9, 'NL': 9
        };

        const max = maxLengths[countryCode] || 15;
        if (digitsOnly.length > max) {
            digitsOnly = digitsOnly.slice(0, max);
        }

        // Country-specific formatting patterns
        const formats: Record<string, (digits: string) => string> = {
            'PT': (d) => d.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3'), // 911 178 179
            'US': (d) => d.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3'), // 555 123 4567
            'CA': (d) => d.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3'), // Same as US
            'GB': (d) => d.replace(/(\d{4})(\d{6})/, '$1 $2'), // 7911 123456
            'ES': (d) => d.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3'), // 600 123 456
            'FR': (d) => d.replace(/(\d{1})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5'), // 6 12 34 56 78
            'DE': (d) => d.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3'), // 151 234 5678
            'IT': (d) => d.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3'), // 312 345 6789
            'BR': (d) => d.replace(/(\d{2})(\d{5})(\d{4})/, '$1 $2 $3'), // 11 98765 4321
            'MX': (d) => d.replace(/(\d{2})(\d{4})(\d{4})/, '$1 $2 $3'), // 55 1234 5678
            'AR': (d) => d.replace(/(\d{2})(\d{4})(\d{4})/, '$1 $2 $3'), // 11 1234 5678
            'AU': (d) => d.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3'), // 412 345 678
            'IN': (d) => d.replace(/(\d{5})(\d{5})/, '$1 $2'), // 98765 43210
            'CN': (d) => d.replace(/(\d{3})(\d{4})(\d{4})/, '$1 $2 $3'), // 138 0013 8000
            'JP': (d) => d.replace(/(\d{2})(\d{4})(\d{4})/, '$1 $2 $3'), // 90 1234 5678
            'KR': (d) => d.replace(/(\d{2})(\d{4})(\d{4})/, '$1 $2 $3'), // 10 1234 5678
            'ZA': (d) => d.replace(/(\d{2})(\d{3})(\d{4})/, '$1 $2 $3'), // 82 123 4567
            'AE': (d) => d.replace(/(\d{2})(\d{3})(\d{4})/, '$1 $2 $3'), // 50 123 4567
            'SA': (d) => d.replace(/(\d{2})(\d{3})(\d{4})/, '$1 $2 $3'), // 50 123 4567
            'NL': (d) => d.replace(/(\d{1})(\d{4})(\d{4})/, '$1 $2 $3'), // 6 1234 5678
        };

        const formatter = formats[countryCode];
        return formatter ? formatter(digitsOnly) : digitsOnly.replace(/(\d{3})(?=\d)/g, '$1 ');
    };

    const handleCountrySelect = (country: Country) => {
        setSelectedCountry(country);
        const phoneNumber = getPhoneNumber();
        const formatted = formatPhoneNumber(phoneNumber, country.code);
        onChange(`${country.dialCode} ${formatted}`);
        setIsOpen(false);
        setSearchQuery("");
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;
        const formatted = formatPhoneNumber(input, selectedCountry.code);
        onChange(`${selectedCountry.dialCode} ${formatted}`);
    };

    const filteredCountries = countries.filter(
        (country) =>
            country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            country.dialCode.includes(searchQuery) ||
            country.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="relative">
            <div className="flex gap-2">
                {/* Country Code Dropdown */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        className="h-full bg-black border border-white/10 rounded-lg px-3 py-3 text-white hover:bg-white/5 transition-colors flex items-center gap-2 min-w-[110px]"
                    >
                        <span className="text-lg">{selectedCountry.flag}</span>
                        <span className="text-sm font-medium">{selectedCountry.dialCode}</span>
                        <ChevronDown className={`w-3 h-3 text-white/40 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-[90]"
                                onClick={() => setIsOpen(false)}
                            />
                            <div className="absolute z-[100] bottom-full mb-1 w-72 bg-[#1A1A1A] border border-white/10 rounded-lg shadow-xl max-h-80 overflow-hidden">
                                {/* Search */}
                                <div className="p-2 border-b border-white/10">
                                    <input
                                        type="text"
                                        placeholder="Search countries..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>

                                {/* Country List */}
                                <div className="overflow-y-auto max-h-64">
                                    {filteredCountries.map((country) => (
                                        <button
                                            key={country.code}
                                            type="button"
                                            onClick={() => handleCountrySelect(country)}
                                            className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-white/10 transition-colors text-left ${selectedCountry.code === country.code ? 'bg-white/5' : ''
                                                }`}
                                        >
                                            <span className="text-xl">{country.flag}</span>
                                            <span className="text-sm text-white flex-1">{country.name}</span>
                                            <span className="text-xs text-white/40 font-mono">{country.dialCode}</span>
                                        </button>
                                    ))}
                                    {filteredCountries.length === 0 && (
                                        <div className="p-4 text-center text-white/40 text-sm">
                                            No countries found
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Phone Number Input */}
                <div className="flex-1 relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input
                        type="tel"
                        placeholder={placeholder}
                        value={getPhoneNumber()}
                        onChange={handlePhoneChange}
                        className="w-full bg-black border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
                    />
                </div>
            </div>
        </div>
    );
}
