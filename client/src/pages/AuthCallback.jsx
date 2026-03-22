import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';

function AuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const setCredentials = useAuthStore((state) => state.setCredentials);

    useEffect(() => {
        const fetchUserProfile = async () => {
            const token = searchParams.get('token');

            if (token) {
                try {
                    // Temporarily set the token in the store so Axios interceptors pick it up
                    setCredentials({ token });

                    // Fetch the full user profile
                    const { data } = await api.get('/auth/me');

                    // Store the complete user object (which includes the token from the backend)
                    // The backend /auth/me returns _id, name, email, avatar. We need to append the token.
                    setCredentials({ ...data, token });

                    // Redirect to home/overview. Layout component will handle OnboardingModal
                    navigate('/dashboard');
                } catch (error) {
                    console.error('Failed to fetch user profile:', error);
                    navigate('/auth?error=invalid_token');
                }
            } else {
                navigate('/auth?error=auth_failed');
            }
        };

        fetchUserProfile();
    }, [searchParams, navigate, setCredentials]);

    return (
        <div className="flex h-screen items-center justify-center bg-[#121212] text-white">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <h2>Authenticating...</h2>
            </div>
        </div>
    );
}

export default AuthCallback;
