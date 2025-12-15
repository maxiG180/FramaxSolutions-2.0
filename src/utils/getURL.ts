export const getURL = (path: string = '') => {
    // Check if we are in a browser environment
    if (typeof window !== 'undefined') {
        return `${window.location.origin}${path}`;
    }

    // In server environment, prefer NEXT_PUBLIC_APP_URL
    let url = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Trim trailing slash if present
    url = url.replace(/\/$/, '');

    // Ensure path starts with slash if not empty
    if (path && !path.startsWith('/')) {
        path = `/${path}`;
    }

    return `${url}${path}`;
};
