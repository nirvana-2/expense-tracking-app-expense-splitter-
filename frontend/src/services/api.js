import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api', // Backend URL
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token if it exists (though we are using HttpOnly cookies usually, 
// let's check if we need to manually attach. Based on backend app.js user provided earlier config, 
// credentials: true suggests cookies. But typical MERN often uses localStorage token.
// I will start with assumption of localStorage for simplicity unless constrained.
// Wait, the previous chat history didn't show auth implementation details but standard is JWT.
// I'll stick to localStorage as it's easier to implement purely frontend-side for now).

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
