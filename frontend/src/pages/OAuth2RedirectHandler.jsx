import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function OAuth2RedirectHandler() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // The token comes in the URL format: ?token=eyJhbGci...
        const searchParams = new URLSearchParams(location.search);
        const token = searchParams.get('token');

        if (token) {
            // Found a token, save it
            localStorage.setItem('jwtToken', token);
            // Redirect the user to the dashboard or home page
            navigate('/dashboard', { replace: true });
        } else {
            // If there's no token, redirect to login page with an error
            navigate('/login?error=oauth2-login-failed', { replace: true });
        }
    }, [location, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <h2 className="text-xl">Logging you in securely...</h2>
        </div>
    );
}
