import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../App';
import { signInWithGoogle, logout } from '../services/firebase';
import { LogIn, LogOut, Loader2 } from 'lucide-react';

export default function AuthDisplay() {
    const { currentUser, authLoading } = useContext(AuthContext);

    if (authLoading) {
        return (
            <div className="flex items-center gap-2 text-gray-400 bg-gray-800/50 px-3 py-2 rounded-lg">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Checking status...</span>
            </div>
        );
    }

    if (currentUser) {
        return (
            <div className="flex items-center gap-3">
                 <Link to="/profile" className="flex items-center gap-3 bg-gray-800/50 p-2 rounded-lg border border-gray-700 hover:border-lime-500 transition-colors" title="Go to My Profile">
                    <img 
                        src={currentUser.photoURL || `https://ui-avatars.com/api/?name=${currentUser.displayName || currentUser.email}&background=a3e635&color=000`} 
                        alt={currentUser.displayName || 'User'} 
                        className="w-10 h-10 rounded-full border-2 border-lime-500" 
                    />
                    <div className="text-left hidden sm:block">
                        <p className="text-white font-semibold text-sm truncate max-w-[150px]">{currentUser.displayName}</p>
                        <p className="text-gray-400 text-xs truncate max-w-[150px]">{currentUser.email}</p>
                    </div>
                </Link>
                <button
                    onClick={logout}
                    className="bg-gray-700 hover:bg-red-600 text-white font-bold p-2 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                    title="Sign Out"
                >
                    <LogOut size={18} />
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={signInWithGoogle}
            className="bg-lime-500 hover:bg-lime-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-lime-500/10"
        >
            <LogIn size={18} />
            Login with Google
        </button>
    );
}