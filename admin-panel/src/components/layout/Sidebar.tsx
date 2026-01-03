// Sidebar Navigation Component
// Main navigation for the admin panel

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    CreditCard,
    LogOut,
    Menu,
    X,
    ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logoutAdmin } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const location = useLocation();
    const { toast } = useToast();
    const navigate = useNavigate();

    const navItems = [
        {
            name: 'Dashboard',
            path: '/dashboard',
            icon: LayoutDashboard,
        },
        {
            name: 'Products',
            path: '/products',
            icon: Package,
        },
        {
            name: 'Orders',
            path: '/orders',
            icon: ShoppingCart,
        },
        {
            name: 'Users',
            path: '/users',
            icon: Users,
        },
        {
            name: 'Payments',
            path: '/payments',
            icon: CreditCard,
        },
    ];

    const handleLogout = async () => {
        try {
            await logoutAdmin();
            toast({
                title: 'Logged Out',
                description: 'You have been successfully logged out',
            });
            navigate('/login');
        } catch (error) {
            toast({
                title: 'Logout Failed',
                description: 'Failed to logout. Please try again.',
                variant: 'destructive',
            });
        }
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed top-0 left-0 z-50 h-screen w-64 bg-gray-900 border-r border-gray-800 transition-transform duration-300 ease-in-out lg:translate-x-0',
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-white font-bold text-lg">Teemaster</h2>
                            <p className="text-gray-400 text-xs">Admin Panel</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="lg:hidden text-gray-400 hover:text-white"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={onClose}
                                className={cn(
                                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                                    isActive
                                        ? 'bg-purple-600 text-white'
                                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                )}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout Button */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
                    <Button
                        onClick={handleLogout}
                        variant="ghost"
                        className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        Logout
                    </Button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
