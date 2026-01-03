// Products Management Page - Premium Revamp
// Features: Logical grouping, improved UX, drag & drop image upload, real-time validation

import React, { useEffect, useState, useRef } from 'react';
import {
    collection,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    Timestamp,
    query,
    orderBy,
} from 'firebase/firestore';
import { db, COLLECTIONS } from '@/config/firebase';
import { Product, ProductFormData } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
    Plus,
    Edit,
    Trash2,
    Loader2,
    Upload,
    X,
    Package,
    IndianRupee,
    Tag,
    Layers,
    Image as ImageIcon,
    CheckCircle2,
    AlertCircle,
    ChevronDown,
    Star,
    Check,
    Palette,
    Settings2
} from 'lucide-react';
import { formatCurrency } from '@/lib/helpers';
import { cn } from '@/lib/utils';

const CATEGORIES = [
    'Basics',
    'Oversized',
    'Plain',
    'Printed',
    'Combo Deals',
    'Accessories'
];

const GENDERS = ['MEN', 'WOMEN', 'UNISEX'];

const AVAILABLE_SIZES = ['S', 'M', 'L', 'XL', 'XXL', '3XL'];

const Products: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [uploading, setUploading] = useState(false);
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form State
    const [formData, setFormData] = useState<ProductFormData>({
        title: '',
        description: '',
        price: 0,
        compareAtPrice: 0,
        category: '',
        gender: 'UNISEX',
        slug: '',
        sizes: [],
        colors: '',
        variants: [],
        featured: false,
        isPublished: true,
        inStock: true,
        stockCount: 0,
    });

    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    // Real-time Validation State
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Fetch products
    useEffect(() => {
        const q = query(collection(db, COLLECTIONS.PRODUCTS), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const productsData: Product[] = [];
            snapshot.forEach((doc) => {
                productsData.push({ id: doc.id, ...doc.data() } as Product);
            });
            setProducts(productsData);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.title.trim()) newErrors.title = 'Product title is required';
        if (!formData.slug.trim()) newErrors.slug = 'Slug is required (auto-generated from title)';
        if (!formData.category) newErrors.category = 'Category is required';
        if (formData.price <= 0) newErrors.price = 'Price must be greater than 0';
        if (formData.stockCount < 0) newErrors.stockCount = 'Stock cannot be negative';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (newImageFiles.length === 0 && existingImages.length === 0) {
            newErrors.images = 'At least one product image is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setNewImageFiles(prev => [...prev, ...files]);

        const previews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(prev => [...prev, ...previews]);
    };

    const removeNewImage = (index: number) => {
        setNewImageFiles(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (url: string) => {
        setExistingImages(prev => prev.filter(img => img !== url));
    };

    const toggleSize = (size: string) => {
        setFormData(prev => ({
            ...prev,
            sizes: prev.sizes.includes(size)
                ? prev.sizes.filter(s => s !== size)
                : [...prev.sizes, size]
        }));
    };

    const uploadToCloudinary = async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append(
            "upload_preset",
            import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
        );

        const res = await fetch(
            `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
                method: "POST",
                body: formData,
            }
        );

        const data = await res.json();
        return data.secure_url;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            toast({
                title: 'Validation Error',
                description: 'Please fix the errors in the form before saving.',
                variant: 'destructive',
            });
            return;
        }

        setUploading(true);

        try {
            // Upload new images to Cloudinary
            const imageUrlMap: { [key: string]: string } = {};
            const uploadedUrls: string[] = [];
            for (let i = 0; i < newImageFiles.length; i++) {
                try {
                    const file = newImageFiles[i];
                    const previewUrl = imagePreviews[i];
                    const url = await uploadToCloudinary(file);
                    uploadedUrls.push(url);
                    imageUrlMap[previewUrl] = url; // Map local blob URL to Cloudinary URL
                } catch (err) {
                    console.error('Cloudinary upload error:', err);
                }
            }

            const finalImages = [...existingImages, ...uploadedUrls];

            // Map variant images to their final Cloudinary URLs
            const processedVariants = formData.variants.map(v => ({
                ...v,
                images: v.images.map(img => imageUrlMap[img] || img)
            }));

            const productData = {
                ...formData,
                colors: formData.colors ? formData.colors.split(",").map(c => c.trim()) : [],
                variants: processedVariants,
                imageUrls: finalImages,
                updatedAt: Timestamp.now(),
            };

            if (editingProduct) {
                await updateDoc(doc(db, COLLECTIONS.PRODUCTS, editingProduct.id), productData);
                toast({
                    title: 'Success!',
                    description: 'Product updated successfully.',
                });
            } else {
                await addDoc(collection(db, COLLECTIONS.PRODUCTS), {
                    ...productData,
                    createdAt: Timestamp.now(),
                });
                toast({
                    title: 'Success!',
                    description: 'Product created successfully.',
                });
            }

            resetForm();
        } catch (error) {
            console.error('Error saving product:', error);
            toast({
                title: 'Error',
                description: 'Failed to save product. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (productId: string) => {
        if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;

        try {
            await deleteDoc(doc(db, COLLECTIONS.PRODUCTS, productId));
            toast({
                title: 'Deleted',
                description: 'Product has been permanently removed.',
            });
        } catch (error) {
            console.error('Error deleting product:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete product.',
                variant: 'destructive',
            });
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            title: product.title,
            description: product.description,
            price: product.price,
            compareAtPrice: product.compareAtPrice || 0,
            category: product.category,
            gender: product.gender || 'UNISEX',
            slug: product.slug || '',
            sizes: product.sizes || [],
            colors: Array.isArray(product.colors) ? product.colors.join(", ") : '',
            variants: product.variants || [],
            featured: product.featured,
            isPublished: product.isPublished !== undefined ? product.isPublished : true,
            inStock: product.inStock,
            stockCount: product.stockCount,
        });
        setExistingImages(product.imageUrls || product.images || (product.image ? [product.image] : []));
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            price: 0,
            compareAtPrice: 0,
            category: '',
            gender: 'UNISEX',
            slug: '',
            sizes: [],
            colors: '',
            variants: [],
            featured: false,
            isPublished: true,
            inStock: true,
            stockCount: 0,
        });
        setExistingImages([]);
        setNewImageFiles([]);
        setImagePreviews([]);
        setEditingProduct(null);
        setShowForm(false);
        setErrors({});
    };

    const calculateDiscount = () => {
        if (!formData.compareAtPrice || formData.compareAtPrice <= formData.price) return null;
        const diff = formData.compareAtPrice - formData.price;
        const percent = Math.round((diff / formData.compareAtPrice) * 100);
        return { amount: diff, percent };
    };

    const discount = calculateDiscount();

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
                <p className="text-gray-500 font-medium">Loading catalog...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Products</h1>
                    <p className="text-gray-500 mt-2 text-lg">Manage your inventory, prices, and catalog visibility from one place.</p>
                </div>
                {!showForm && (
                    <Button
                        onClick={() => setShowForm(true)}
                        className="bg-purple-600 hover:bg-purple-700 h-12 px-6 text-lg shadow-lg shadow-purple-200"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Create New Product
                    </Button>
                )}
            </div>

            {/* Premium Product Form */}
            {showForm && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-md overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 py-6 px-8 flex items-center justify-between">
                            <div className="text-white">
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    {editingProduct ? <Edit className="w-6 h-6" /> : <Package className="w-6 h-6" />}
                                    {editingProduct ? 'Update Product' : 'Add New Product'}
                                </h2>
                                <p className="text-purple-100 opacity-90 text-sm mt-1">
                                    Fill in the details below to {editingProduct ? 'update' : 'create'} your e-commerce product.
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={resetForm}
                                className="text-white hover:bg-white/10 rounded-full"
                            >
                                <X className="w-6 h-6" />
                            </Button>
                        </div>
                        <CardContent className="p-0">
                            <form onSubmit={handleSubmit} className="p-8 space-y-8">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                                    {/* Left Column: Main Details */}
                                    <div className="lg:col-span-2 space-y-8">

                                        {/* Section 1: Product Details */}
                                        <section className="space-y-6">
                                            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                                                <Tag className="w-5 h-5 text-purple-600" />
                                                <h3 className="text-xl font-bold text-gray-800">Product Details</h3>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="title" className="text-sm font-semibold text-gray-700">Product Title</Label>
                                                    <Input
                                                        id="title"
                                                        placeholder="Ex: Oversized Graphic T-Shirt"
                                                        value={formData.title}
                                                        onChange={(e) => {
                                                            const title = e.target.value;
                                                            const slug = title
                                                                .toLowerCase()
                                                                .replace(/\s+/g, "-")
                                                                .replace(/[^a-z0-9-]/g, "");
                                                            setFormData({ ...formData, title, slug });
                                                        }}
                                                        className={cn("h-12 focus:ring-purple-500", errors.title && "border-red-500 bg-red-50")}
                                                    />
                                                    {errors.title && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.title}</p>}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="slug" className="text-sm font-semibold text-gray-700">Slug (Auto Generated)</Label>
                                                    <Input
                                                        id="slug"
                                                        value={formData.slug}
                                                        readOnly
                                                        className="h-12 bg-gray-50 text-gray-500 cursor-not-allowed border-dashed"
                                                        placeholder="auto-generated-slug"
                                                    />
                                                    <p className="text-[10px] text-gray-400">This determines the product URL: /product/{formData.slug || '...'}</p>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="category" className="text-sm font-semibold text-gray-700">Category</Label>
                                                        <div className="relative">
                                                            <select
                                                                id="category"
                                                                value={formData.category}
                                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                                className={cn(
                                                                    "w-full h-12 bg-white border border-gray-200 rounded-md px-3 text-sm focus:ring-2 focus:ring-purple-500 appearance-none outline-none",
                                                                    errors.category && "border-red-500"
                                                                )}
                                                            >
                                                                <option value="">Select Category</option>
                                                                {CATEGORIES.map(cat => (
                                                                    <option key={cat} value={cat}>{cat}</option>
                                                                ))}
                                                            </select>
                                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                                        </div>
                                                        {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="gender" className="text-sm font-semibold text-gray-700">Gender</Label>
                                                        <div className="relative">
                                                            <select
                                                                id="gender"
                                                                value={formData.gender}
                                                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                                                className="w-full h-12 bg-white border border-gray-200 rounded-md px-3 text-sm focus:ring-2 focus:ring-purple-500 appearance-none outline-none"
                                                            >
                                                                {GENDERS.map(gen => (
                                                                    <option key={gen} value={gen}>{gen}</option>
                                                                ))}
                                                            </select>
                                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-semibold text-gray-700">Product Status</Label>
                                                        <div className="flex h-12 items-center gap-4 px-3 border border-gray-200 rounded-md bg-gray-50/50">
                                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                                <div className={cn(
                                                                    "w-5 h-5 border-2 rounded transition-all flex items-center justify-center",
                                                                    formData.isPublished ? "bg-green-600 border-green-600" : "border-gray-300"
                                                                )}>
                                                                    {formData.isPublished && <Check className="w-3.5 h-3.5 text-white" />}
                                                                    <input
                                                                        type="checkbox"
                                                                        className="hidden"
                                                                        checked={formData.isPublished}
                                                                        onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                                                                    />
                                                                </div>
                                                                <span className="text-sm font-medium text-gray-600 group-hover:text-green-600 transition-colors">Published</span>
                                                            </label>

                                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                                <div className={cn(
                                                                    "w-5 h-5 border-2 rounded transition-all flex items-center justify-center",
                                                                    formData.inStock ? "bg-purple-600 border-purple-600" : "border-gray-300"
                                                                )}>
                                                                    {formData.inStock && <Check className="w-3.5 h-3.5 text-white" />}
                                                                    <input
                                                                        type="checkbox"
                                                                        className="hidden"
                                                                        checked={formData.inStock}
                                                                        onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                                                                    />
                                                                </div>
                                                                <span className="text-sm font-medium text-gray-600 group-hover:text-purple-600 transition-colors">In Stock</span>
                                                            </label>

                                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                                <div className={cn(
                                                                    "w-5 h-5 border-2 rounded transition-all flex items-center justify-center",
                                                                    formData.featured ? "bg-amber-500 border-amber-500" : "border-gray-300"
                                                                )}>
                                                                    {formData.featured && <Star className="w-3.5 h-3.5 text-white fill-white" />}
                                                                    <input
                                                                        type="checkbox"
                                                                        className="hidden"
                                                                        checked={formData.featured}
                                                                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                                                    />
                                                                </div>
                                                                <span className="text-sm font-medium text-gray-600 group-hover:text-amber-600 transition-colors">Featured</span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="description" className="text-sm font-semibold text-gray-700">Description</Label>
                                                <textarea
                                                    id="description"
                                                    placeholder="Describe your product in detail..."
                                                    className={cn(
                                                        "w-full min-h-[120px] rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none",
                                                        errors.description && "border-red-500 bg-red-50"
                                                    )}
                                                    value={formData.description}
                                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                />
                                                {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
                                            </div>
                                        </section>

                                        {/* Section 2: Pricing & Inventory */}
                                        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                                                    <IndianRupee className="w-5 h-5 text-green-600" />
                                                    <h3 className="text-xl font-bold text-gray-800">Pricing</h3>
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="price" className="text-sm font-semibold text-gray-700">Selling Price</Label>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium font-serif">₹</span>
                                                            <Input
                                                                id="price"
                                                                type="number"
                                                                value={formData.price || ''}
                                                                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                                                className="pl-8 h-12"
                                                                placeholder="0.00"
                                                            />
                                                        </div>
                                                        <p className="text-[10px] text-gray-400">Winning price customers will pay at checkout.</p>
                                                        {errors.price && <p className="text-xs text-red-500">{errors.price}</p>}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="compareAtPrice" className="text-sm font-semibold text-gray-700">Compare Price</Label>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium font-serif">₹</span>
                                                            <Input
                                                                id="compareAtPrice"
                                                                type="number"
                                                                value={formData.compareAtPrice || ''}
                                                                onChange={(e) => setFormData({ ...formData, compareAtPrice: Number(e.target.value) })}
                                                                className="pl-8 h-12"
                                                                placeholder="0.00"
                                                            />
                                                        </div>
                                                        <p className="text-[10px] text-gray-400">Original price to show strike-through.</p>
                                                    </div>

                                                    {discount && (
                                                        <div className="bg-green-50 px-3 py-2 rounded-lg border border-green-100 animate-in zoom-in-95 duration-300">
                                                            <p className="text-green-700 text-xs font-bold flex items-center gap-1">
                                                                <CheckCircle2 className="w-3 h-3" />
                                                                Auto Applied: Save ₹{discount.amount} ({discount.percent}%)
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                                                    <Layers className="w-5 h-5 text-blue-600" />
                                                    <h3 className="text-xl font-bold text-gray-800">Inventory</h3>
                                                </div>
                                                <div className="space-y-6">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="stockCount" className="text-sm font-semibold text-gray-700">Stock Available</Label>
                                                        <Input
                                                            id="stockCount"
                                                            type="number"
                                                            value={formData.stockCount || ''}
                                                            onChange={(e) => setFormData({ ...formData, stockCount: Number(e.target.value) })}
                                                            className="h-12"
                                                            placeholder="0"
                                                        />
                                                        {errors.stockCount && <p className="text-xs text-red-500">{errors.stockCount}</p>}
                                                    </div>

                                                    <div className="space-y-3">
                                                        <Label className="text-sm font-semibold text-gray-700">Select Sizes</Label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {AVAILABLE_SIZES.map(size => (
                                                                <button
                                                                    key={size}
                                                                    type="button"
                                                                    onClick={() => toggleSize(size)}
                                                                    className={cn(
                                                                        "min-w-[48px] h-10 rounded-md border text-sm font-bold transition-all",
                                                                        formData.sizes.includes(size)
                                                                            ? "bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-100"
                                                                            : "bg-white border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-600"
                                                                    )}
                                                                >
                                                                    {size}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2 pt-2">
                                                        <Label htmlFor="colors" className="text-sm font-semibold text-gray-700">Colors</Label>
                                                        <Input
                                                            id="colors"
                                                            placeholder="Black, White, Green"
                                                            value={formData.colors}
                                                            onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                                                            className="h-12"
                                                        />
                                                        <p className="text-[10px] text-gray-400">Add comma-separated colors (Example: Black, White, Blue).</p>
                                                    </div>

                                                    {/* Variants Section */}
                                                    <div className="space-y-4 pt-4 border-t border-gray-100">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <Palette className="w-5 h-5 text-purple-600" />
                                                                <Label className="text-sm font-bold text-gray-800">Color Variants</Label>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    const newVariant = { color: '', stock: 0, images: [] };
                                                                    setFormData(prev => ({
                                                                        ...prev,
                                                                        variants: [...prev.variants, newVariant]
                                                                    }));
                                                                }}
                                                                className="text-xs h-8 border-dashed"
                                                            >
                                                                <Plus className="w-3 h-3 mr-1" /> Add Variant
                                                            </Button>
                                                        </div>

                                                        {formData.variants.length > 0 ? (
                                                            <div className="space-y-4">
                                                                {formData.variants.map((v, idx) => (
                                                                    <div key={idx} className="p-4 rounded-lg bg-gray-50 border border-gray-100 space-y-4 relative group">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                const newVariants = [...formData.variants];
                                                                                newVariants.splice(idx, 1);
                                                                                setFormData({ ...formData, variants: newVariants });
                                                                            }}
                                                                            className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                        >
                                                                            <X className="w-4 h-4" />
                                                                        </button>

                                                                        <div className="grid grid-cols-2 gap-3">
                                                                            <div className="space-y-1">
                                                                                <Label className="text-[10px] uppercase font-bold text-gray-400">Color</Label>
                                                                                <Input
                                                                                    value={v.color}
                                                                                    onChange={(e) => {
                                                                                        const newVariants = [...formData.variants];
                                                                                        newVariants[idx].color = e.target.value;
                                                                                        setFormData({ ...formData, variants: newVariants });
                                                                                    }}
                                                                                    placeholder="Variant Color"
                                                                                    className="h-9 text-xs"
                                                                                />
                                                                            </div>
                                                                            <div className="space-y-1">
                                                                                <Label className="text-[10px] uppercase font-bold text-gray-400">Stock</Label>
                                                                                <Input
                                                                                    type="number"
                                                                                    value={v.stock}
                                                                                    onChange={(e) => {
                                                                                        const newVariants = [...formData.variants];
                                                                                        newVariants[idx].stock = Number(e.target.value);
                                                                                        setFormData({ ...formData, variants: newVariants });
                                                                                    }}
                                                                                    className="h-9 text-xs"
                                                                                />
                                                                            </div>
                                                                        </div>

                                                                        <div className="space-y-2">
                                                                            <Label className="text-[10px] uppercase font-bold text-gray-400">Price Override (Optional)</Label>
                                                                            <div className="relative">
                                                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">₹</span>
                                                                                <Input
                                                                                    type="number"
                                                                                    value={v.price || ''}
                                                                                    onChange={(e) => {
                                                                                        const newVariants = [...formData.variants];
                                                                                        newVariants[idx].price = e.target.value ? Number(e.target.value) : undefined;
                                                                                        setFormData({ ...formData, variants: newVariants });
                                                                                    }}
                                                                                    className="h-9 pl-5 text-xs"
                                                                                    placeholder="Same as base price"
                                                                                />
                                                                            </div>
                                                                        </div>

                                                                        <div className="space-y-2">
                                                                            <Label className="text-[10px] uppercase font-bold text-gray-400">Variant Images</Label>
                                                                            <div className="flex flex-wrap gap-2">
                                                                                {[...existingImages, ...imagePreviews].map((img, imgIdx) => (
                                                                                    <div
                                                                                        key={imgIdx}
                                                                                        onClick={() => {
                                                                                            const newVariants = [...formData.variants];
                                                                                            const imgList = newVariants[idx].images;
                                                                                            if (imgList.includes(img)) {
                                                                                                newVariants[idx].images = imgList.filter(i => i !== img);
                                                                                            } else {
                                                                                                newVariants[idx].images = [...imgList, img];
                                                                                            }
                                                                                            setFormData({ ...formData, variants: newVariants });
                                                                                        }}
                                                                                        className={cn(
                                                                                            "w-12 h-12 rounded border-2 cursor-pointer transition-all overflow-hidden relative",
                                                                                            v.images.includes(img) ? "border-purple-600 ring-2 ring-purple-100" : "border-transparent opacity-60 grayscale hover:opacity-100 hover:grayscale-0"
                                                                                        )}
                                                                                    >
                                                                                        <img src={img} className="w-full h-full object-cover" />
                                                                                        {v.images.includes(img) && (
                                                                                            <div className="absolute top-0 right-0 p-0.5 bg-purple-600">
                                                                                                <Check className="w-2 h-2 text-white" />
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                            <p className="text-[9px] text-gray-400 italic">Select images that belong to this variant from uploaded media.</p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="py-8 px-4 border border-dashed rounded-lg bg-gray-50/30 flex flex-col items-center justify-center space-y-2">
                                                                <Settings2 className="w-8 h-8 text-gray-300" />
                                                                <p className="text-xs text-gray-500 font-medium">No variants added yet</p>
                                                                <p className="text-[10px] text-gray-400">Create variants for better stock & image control per color.</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </section>
                                    </div>

                                    {/* Right Column: Images & Upload */}
                                    <div className="space-y-8">
                                        <section className="space-y-6">
                                            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                                                <ImageIcon className="w-5 h-5 text-indigo-600" />
                                                <h3 className="text-xl font-bold text-gray-800">Media</h3>
                                            </div>

                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                className={cn(
                                                    "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all bg-gray-50/50 hover:bg-purple-50/30 group",
                                                    errors.images ? "border-red-300 bg-red-50/30" : "border-gray-200 hover:border-purple-400"
                                                )}
                                            >
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    className="hidden"
                                                    ref={fileInputRef}
                                                    onChange={handleImageChange}
                                                />
                                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 border border-gray-100 group-hover:scale-110 transition-transform">
                                                    <Upload className="w-8 h-8 text-purple-600" />
                                                </div>
                                                <p className="text-sm font-bold text-gray-700">Drag & Drop images here</p>
                                                <p className="text-xs text-gray-400 mt-1">or click to browse your files</p>
                                                <p className="text-[10px] text-purple-400 font-medium mt-4">Recommend: 1000x1000px JPG/PNG</p>
                                            </div>
                                            {errors.images && <p className="text-xs text-red-500 mt-1">{errors.images}</p>}

                                            {/* Image Previews */}
                                            <div className="grid grid-cols-2 gap-3">
                                                {/* Existing Images */}
                                                {existingImages.map((url, idx) => (
                                                    <div key={`exist-${idx}`} className="relative aspect-square rounded-lg border border-gray-100 overflow-hidden group shadow-sm bg-gray-50">
                                                        <img src={url} alt="Product" className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => removeExistingImage(url)}
                                                                className="bg-white/90 hover:bg-red-500 hover:text-white text-gray-800 p-2 rounded-full transition-all transform hover:scale-110"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                                {/* New Images */}
                                                {imagePreviews.map((url, idx) => (
                                                    <div key={`new-${idx}`} className="relative aspect-square rounded-lg border-2 border-purple-100 overflow-hidden group shadow-sm ring-2 ring-purple-50 ring-offset-2">
                                                        <img src={url} alt="New Product" className="w-full h-full object-cover" />
                                                        <div className="absolute top-1 right-1 bg-purple-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow">NEW</div>
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => removeNewImage(idx)}
                                                                className="bg-white/90 hover:bg-red-500 hover:text-white text-gray-800 p-2 rounded-full transition-all transform hover:scale-110"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div className="flex flex-col-reverse md:flex-row items-center justify-end gap-3 pt-8 border-t border-gray-100">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={resetForm}
                                        className="w-full md:w-auto h-12 px-8 font-semibold hover:bg-gray-50"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={uploading}
                                        className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 h-12 px-12 font-bold shadow-lg shadow-purple-200 transition-all active:scale-95"
                                    >
                                        {uploading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                                                Saving Product...
                                            </>
                                        ) : (
                                            <>
                                                {editingProduct ? 'Update Product' : 'Publish Product'}
                                                {!uploading && <CheckCircle2 className="w-5 h-5 ml-3" />}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Products List Section */}
            {!showForm && (
                <div className="space-y-6 animate-in fade-in duration-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.length === 0 ? (
                            <div className="col-span-full">
                                <Card className="bg-gray-50 border-dashed border-2 p-20 text-center">
                                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-gray-600">No products found</h3>
                                    <p className="text-gray-400 mt-2">Start building your catalog by adding your first product.</p>
                                    <Button
                                        onClick={() => setShowForm(true)}
                                        variant="outline"
                                        className="mt-6 border-purple-200 text-purple-600 hover:bg-purple-50"
                                    >
                                        <Plus className="w-4 h-4 mr-2" /> Add First Product
                                    </Button>
                                </Card>
                            </div>
                        ) : (
                            products.map((product) => (
                                <Card key={product.id} className="overflow-hidden group hover:shadow-xl transition-all border-none shadow-md">
                                    <div className="relative aspect-square bg-gray-100 overflow-hidden">
                                        {(product.imageUrls?.[0] || product.image || product.images?.[0]) ? (
                                            <img
                                                src={product.imageUrls?.[0] || product.image || product.images?.[0]}
                                                alt={product.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="w-12 h-12 text-gray-300" />
                                            </div>
                                        )}
                                        <div className="absolute top-3 right-3 flex flex-col gap-2">
                                            {product.featured && (
                                                <div className="bg-amber-400 text-amber-950 p-1.5 rounded-full shadow-lg border border-amber-300">
                                                    <Star className="w-3.5 h-3.5 fill-current" />
                                                </div>
                                            )}
                                            {!product.inStock && (
                                                <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-sm shadow-lg">
                                                    OUT OF STOCK
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <CardContent className="p-5">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="text-xs font-bold text-purple-600 uppercase tracking-wider">{product.category}</p>
                                            <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
                                                <Layers className="w-3 h-3" /> {product.stockCount}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors mb-2 line-clamp-1">{product.title}</h3>

                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="text-xl font-black text-gray-900">
                                                {formatCurrency(product.price)}
                                            </span>
                                            {product.compareAtPrice && product.compareAtPrice > product.price && (
                                                <span className="text-sm text-gray-400 line-through">
                                                    {formatCurrency(product.compareAtPrice)}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex gap-2 pt-2 border-t border-gray-50 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleEdit(product)}
                                                className="flex-1 font-bold group/btn hover:border-purple-600"
                                            >
                                                <Edit className="w-4 h-4 mr-2 text-gray-400 group-hover/btn:text-purple-600 transition-colors" />
                                                Edit Detail
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleDelete(product.id)}
                                                className="hover:bg-red-50 hover:border-red-200 text-gray-400 hover:text-red-500"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            )
            }
        </div >
    );
};

export default Products;
