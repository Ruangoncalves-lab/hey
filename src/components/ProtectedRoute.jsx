import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = () => {
    const { session, loading } = useSession();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen w-full bg-gray-50">
                <Loader2 size={48} className="animate-spin text-emerald-600" />
                <p className="ml-4 text-lg text-gray-700">Carregando sessão...</p>
            </div>
        );
    }

    if (!session) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;