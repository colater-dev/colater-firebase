export interface UnsplashImage {
    id: string;
    width: number;
    height: number;
    color: string;
    blur_hash: string;
    description: string | null;
    alt_description: string | null;
    urls: {
        raw: string;
        full: string;
        regular: string;
        small: string;
        thumb: string;
    };
    links: {
        self: string;
        html: string;
        download: string;
        download_location: string;
    };
    user: {
        id: string;
        username: string;
        name: string;
        portfolio_url: string | null;
        bio: string | null;
        profile_image: {
            small: string;
            medium: string;
            large: string;
        };
        links: {
            self: string;
            html: string;
            photos: string;
            likes: string;
            portfolio: string;
        };
    };
}

export interface SearchResponse {
    total: number;
    total_pages: number;
    results: UnsplashImage[];
}
