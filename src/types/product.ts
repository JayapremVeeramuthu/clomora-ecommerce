export interface ProductSize {
    size: string;
    stock: number;
}

export interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    originalPrice?: number;
    description: string;
    images: string[];
    imageUrls?: string[];
    image?: string;
    category: string;
    gender: string;
    fit: string;
    fabric?: string;
    neckType?: string;
    sleeve?: string;
    printType?: string;
    sizes: ProductSize[];
    colors: string[];
    rating: number;
    reviews: number;
    modelInfo?: string;
    fabricCare?: string[];
    isFeatured?: boolean;
    isNew?: boolean;
    isBestseller?: boolean;
    featured?: boolean;
    isPublished?: boolean;
    createdAt?: any;
}
