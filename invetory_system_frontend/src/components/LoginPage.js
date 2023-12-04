import React, { useState } from 'react';
import './LoginPage.css';
import { useUserContext } from '../context/UserContext';
import { useNavigate  } from 'react-router-dom';

const LoginPage = () => {
    const navigate = useNavigate();
    const { loginUser } = useUserContext();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLoginClick = async () => {
        try {
            const response = await fetch('http://127.0.0.1:5000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: username,
                    password: password,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Login successful:', data);
                loginUser(data.user);
                navigate('/home')
            } else {
                const errorData = await response.json();
                console.error('Login failed:', errorData);
            }
        } catch (error) {
            console.error('An error occurred during login:', error);
        }
    };

    return (
        <div className="login-container">
            <h2>Inventory Management System</h2>
            <form className="login-form">
                <div className="form-group">
                    <label htmlFor="username">Username:</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button type="button" onClick={handleLoginClick}>
                    Login
                </button>
            </form>
        </div>
    );
};

export default LoginPage;
