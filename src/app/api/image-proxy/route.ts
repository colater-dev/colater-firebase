import { NextResponse } from 'next/server';

/**
 * Next.js Image Optimization API Route
 * This route proxies Firebase Storage images through Next.js Image Optimization
 * which provides automatic caching, resizing, and format conversion
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
        return new NextResponse('Missing image URL', { status: 400 });
    }

    try {
        // Fetch the image from Firebase Storage
        const response = await fetch(imageUrl);

        if (!response.ok) {
            return new NextResponse('Failed to fetch image', { status: response.status });
        }

        const imageBuffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'image/png';

        // Return the image with caching headers
        return new NextResponse(imageBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
            },
        });
    } catch (error) {
        console.error('Error fetching image:', error);
        return new NextResponse('Error fetching image', { status: 500 });
    }
}
