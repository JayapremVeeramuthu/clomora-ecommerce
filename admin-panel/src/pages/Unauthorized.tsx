// Unauthorized Page
// Shown when non-admin users try to access the admin panel

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';

const Unauthorized: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
            <Card className="w-full max-w-md border-gray-700 bg-gray-800/50 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mb-6">
                        <ShieldAlert className="w-8 h-8 text-white" />
                    </div>

                    <h1 className="text-2xl font-bold text-white mb-3">Access Denied</h1>

                    <p className="text-gray-300 mb-6">
                        You do not have permission to access the admin panel. This area is restricted to authorized administrators only.
                    </p>

                    <div className="space-y-3">
                        <Button
                            onClick={() => navigate('/login')}
                            className="w-full bg-purple-600 hover:bg-purple-700"
                        >
                            Back to Login
                        </Button>

                        <p className="text-sm text-gray-400">
                            If you believe this is an error, please contact the system administrator.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Unauthorized;
