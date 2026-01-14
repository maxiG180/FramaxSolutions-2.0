/**
 * Utility to load custom fonts into jsPDF
 * This allows using the same fonts as the web preview
 */

import { jsPDF } from 'jspdf';

// Outfit font base64 data will be fetched and cached
let outfitFontCache: string | null = null;

/**
 * Fetch Outfit font from local file and convert to base64
 */
async function fetchOutfitFont(): Promise<string> {
    try {
        // Use cached version if available
        if (outfitFontCache) {
            return outfitFontCache;
        }

        // Fetch the font from local public directory
        const response = await fetch('/fonts/Outfit-Regular.ttf');

        if (!response.ok) {
            throw new Error('Failed to fetch Outfit font from /fonts/Outfit-Regular.ttf');
        }

        const fontBuffer = await response.arrayBuffer();
        const base64Font = arrayBufferToBase64(fontBuffer);

        // Cache for future use
        outfitFontCache = base64Font;

        return base64Font;
    } catch (error) {
        throw error;
    }
}

/**
 * Convert ArrayBuffer to base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

/**
 * Load Outfit font into jsPDF document
 * Returns true if successful, false if fallback to Helvetica is needed
 */
export async function loadOutfitFont(doc: jsPDF): Promise<boolean> {
    try {
        // Fetch the Outfit font
        const outfitBase64 = await fetchOutfitFont();

        // Add font to jsPDF virtual file system
        doc.addFileToVFS('Outfit-Regular.ttf', outfitBase64);

        // Register the font
        doc.addFont('Outfit-Regular.ttf', 'Outfit', 'normal');

        // Also add bold version (we'll use the same font with bold style)
        doc.addFont('Outfit-Regular.ttf', 'Outfit', 'bold');

        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Get font size multiplier to compensate for font differences
 * Outfit appears larger than Helvetica at the same point size
 * So we need to use larger sizes with Helvetica to match
 */
export function getFontSizeMultiplier(usingCustomFont: boolean): number {
    // If using Helvetica instead of Outfit, increase sizes by ~15%
    return usingCustomFont ? 1.0 : 1.15;
}

/**
 * Get adjusted font size for PDF to match web preview
 */
export function getAdjustedFontSize(baseSize: number, usingCustomFont: boolean): number {
    return Math.round(baseSize * getFontSizeMultiplier(usingCustomFont));
}
