import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';
import './Profile.css';

const Profile = () => {
    const [token, setToken] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (!storedToken) {
            navigate('/login');
        } else {
            setToken(storedToken);
        }
    }, [navigate]);

    const handleLogout = () => {
        AuthService.logout();
        navigate('/login');
    };

    return (
        <div className="profile-container">
            <div className="profile-card">
                <h2>User Profile</h2>
                <div className="token-info">
                    <p><strong>Status:</strong> Logged In</p>
                    <p><strong>Your JWT Token:</strong></p>
                    <textarea readOnly value={token || ''} />
                </div>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
        </div>
    );
};

export default Profile;
