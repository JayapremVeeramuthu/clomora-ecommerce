// Header Component
// Top navigation bar with user info and mobile menu toggle

import React from 'react';
import { Menu, Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
    onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
    const { user } = useAuth();

    return (
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 lg:px-6">
            <div className="flex items-center justify-between">
                {/* Left: Mobile Menu Button */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onMenuClick}
                        className="lg:hidden"
                    >
                        <Menu className="w-6 h-6" />
                    </Button>
                    <h1 className="text-xl font-semibold text-gray-900 hidden sm:block">
                        Admin Panel
                    </h1>
                </div>

                {/* Right: User Info & Notifications */}
                <div className="flex items-center gap-3">
                    {/* Notifications */}
                    <Button variant="ghost" size="icon" className="relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                    </Button>

                    {/* User Info */}
                    <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                            {user?.photoURL ? (
                                <img
                                    src={user.photoURL}
                                    alt="Admin"
                                    className="w-8 h-8 rounded-full"
                                />
                            ) : (
                                <User className="w-4 h-4 text-white" />
                            )}
                        </div>
                        <div className="hidden sm:block">
                            <p className="text-sm font-medium text-gray-900">
                                {user?.email?.split('@')[0] || 'Admin'}
                            </p>
                            <p className="text-xs text-gray-500">Administrator</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
