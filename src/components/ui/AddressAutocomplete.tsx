"use client";

import { useState, useMemo, useEffect } from "react";
import usePlacesAutocomplete, {
    getGeocode,
    getLatLng,
} from "use-places-autocomplete";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { Loader2, MapPin } from "lucide-react";

interface AddressAutocompleteProps {
    onSelect: (address: string, country: string, lat?: number, lng?: number) => void;
    defaultValue?: string;
    defaultCountry?: string;
}

const libraries: ("places")[] = ["places"];

export function AddressAutocomplete({ onSelect, defaultValue = "", defaultCountry = "" }: AddressAutocompleteProps) {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        libraries: libraries,
    });

    if (loadError) {
        return (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm">
                Error loading Google Maps. Check your configuration or billing.
            </div>
        );
    }

    if (!isLoaded) return <div className="animate-pulse bg-white/5 h-12 rounded-lg"></div>;

    return <SearchBox onSelect={onSelect} defaultValue={defaultValue} />;
}

function SearchBox({ onSelect, defaultValue }: { onSelect: any, defaultValue: string }) {
    const {
        ready,
        value,
        setValue,
        suggestions: { status, data },
        clearSuggestions,
    } = usePlacesAutocomplete({
        requestOptions: {
            /* Define search scope here if needed */
        },
        debounce: 300,
        defaultValue: defaultValue,
    });

    const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
    const [lastSelectedValue, setLastSelectedValue] = useState<string>("");

    // Update local value if defaultValue changes (e.g. editing a client)
    useEffect(() => {
        if (defaultValue) {
            setValue(defaultValue, false);
            setLastSelectedValue(defaultValue);
            // Optionally geocode here to set map center if needed, but might be overkill to auto-fetch on every edit load without user interaction
        }
    }, [defaultValue, setValue]);

    const handleSelect = async (address: string) => {
        setValue(address, false);
        clearSuggestions();
        setLastSelectedValue(address);

        try {
            const results = await getGeocode({ address });
            const { lat, lng } = await getLatLng(results[0]);
            setCoordinates({ lat, lng });

            // Extract country
            const countryComponent = results[0].address_components.find(c => c.types.includes("country"));
            const country = countryComponent ? countryComponent.long_name : "";

            onSelect(address, country, lat, lng);
        } catch (error) {
        }
    };

    // Handle manual input (when user types without selecting from suggestions)
    const handleBlur = async () => {
        // Only save if value changed and wasn't already saved via handleSelect
        if (value && value.trim() && value !== lastSelectedValue) {
            setLastSelectedValue(value);

            // Try to geocode manually typed address to extract country
            try {
                const results = await getGeocode({ address: value });
                if (results && results[0]) {
                    const { lat, lng } = await getLatLng(results[0]);
                    setCoordinates({ lat, lng });

                    // Extract country from geocoded address
                    const countryComponent = results[0].address_components.find(c => c.types.includes("country"));
                    const country = countryComponent ? countryComponent.long_name : "Portugal"; // Default to Portugal

                    console.log('📍 Geocoded manual address:', { address: value, country, lat, lng });
                    onSelect(value, country, lat, lng);
                } else {
                    // Fallback: try to extract country from text, default to Portugal
                    const country = extractCountryFromText(value);
                    console.log('📍 Manual address (no geocode):', { address: value, country });
                    onSelect(value, country);
                }
            } catch (error) {
                // If geocoding fails, try to extract country from address text, default to Portugal
                const country = extractCountryFromText(value);
                console.log('📍 Manual address (geocoding failed):', { address: value, country });
                onSelect(value, country);
            }
        }
    };

    // Simple function to extract country from address string
    const extractCountryFromText = (address: string): string => {
        const addressLower = address.toLowerCase();

        // Common countries (add more as needed)
        const countries: { [key: string]: string } = {
            'portugal': 'Portugal',
            'españa': 'Spain',
            'spain': 'Spain',
            'france': 'France',
            'frança': 'France',
            'united kingdom': 'United Kingdom',
            'uk': 'United Kingdom',
            'germany': 'Germany',
            'alemanha': 'Germany',
            'italy': 'Italy',
            'itália': 'Italy',
            'brasil': 'Brazil',
            'brazil': 'Brazil',
        };

        for (const [key, value] of Object.entries(countries)) {
            if (addressLower.includes(key)) {
                return value;
            }
        }

        // Default to Portugal if no country detected
        return 'Portugal';
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium text-white/60">
                    Morada Completa
                </label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onBlur={handleBlur}
                        disabled={!ready}
                        className="w-full bg-black border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                        placeholder="Comece a escrever a morada..."
                    />

                {status === "OK" && (
                    <ul className="absolute z-50 w-full mt-1 bg-[#1A1A1A] border border-white/10 rounded-lg shadow-xl max-h-60 overflow-auto">
                        {data.map(({ place_id, description }) => (
                            <li
                                key={place_id}
                                onClick={() => handleSelect(description)}
                                className="px-4 py-2 hover:bg-white/10 cursor-pointer text-sm text-white/80 transition-colors border-l-2 border-transparent hover:border-blue-500"
                            >
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-3 h-3 text-blue-400 shrink-0" />
                                    <span>{description}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
                </div>
            </div>

            {/* Map Preview */}
            <div className="w-full h-48 rounded-xl overflow-hidden border border-white/10 relative bg-white/5">
                {coordinates ? (
                    <GoogleMap
                        zoom={15}
                        center={coordinates}
                        mapContainerClassName="w-full h-full"
                        options={{
                            disableDefaultUI: true,
                            zoomControl: true,
                            styles: [
                                {
                                    "elementType": "geometry",
                                    "stylers": [{ "color": "#1a1a1a" }]
                                },
                                {
                                    "elementType": "labels.text.stroke",
                                    "stylers": [{ "color": "#000000" }]
                                },
                                {
                                    "elementType": "labels.text.fill",
                                    "stylers": [{ "color": "#999999" }]
                                },
                                {
                                    "featureType": "administrative.locality",
                                    "elementType": "labels.text.fill",
                                    "stylers": [{ "color": "#60a5fa" }]
                                },
                                {
                                    "featureType": "poi",
                                    "elementType": "labels.text.fill",
                                    "stylers": [{ "color": "#a78bfa" }]
                                },
                                {
                                    "featureType": "road",
                                    "elementType": "geometry",
                                    "stylers": [{ "color": "#2d2d2d" }]
                                },
                                {
                                    "featureType": "road",
                                    "elementType": "geometry.stroke",
                                    "stylers": [{ "color": "#404040" }]
                                },
                                {
                                    "featureType": "road.highway",
                                    "elementType": "geometry",
                                    "stylers": [{ "color": "#3b82f6" }]
                                },
                                {
                                    "featureType": "road.highway",
                                    "elementType": "geometry.stroke",
                                    "stylers": [{ "color": "#2563eb" }]
                                },
                                {
                                    "featureType": "water",
                                    "elementType": "geometry",
                                    "stylers": [{ "color": "#1e3a5f" }]
                                },
                                {
                                    "featureType": "water",
                                    "elementType": "labels.text.fill",
                                    "stylers": [{ "color": "#60a5fa" }]
                                }
                            ]
                        }}
                    >
                        <Marker position={coordinates} />
                    </GoogleMap>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20 gap-2">
                        <MapPin className="w-8 h-8" />
                        <span className="text-xs font-medium uppercase tracking-wider">Map Preview</span>
                    </div>
                )}
            </div>
        </div>
    );
}
