import axios from 'axios';

// Create an Axios instance configured for the Smart Campus API
const apiClient = axios.create({
    baseURL: 'http://localhost:8081',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to automatically attach the JWT token 
// to every request via the Authorization header
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('jwtToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle global authentication errors (like expired tokens)
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // If the API returns a 401 (Unauthorized) status, 
        // the token is likely invalid or expired.
        if (error.response && error.response.status === 401) {
            // Clear the invalid token from storage
            localStorage.removeItem('jwtToken');
            // Redirect the user back to the login page
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default apiClient;
