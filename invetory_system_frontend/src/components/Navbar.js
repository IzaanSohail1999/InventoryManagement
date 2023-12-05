import React from 'react';
import {Outlet, Link, useNavigate} from 'react-router-dom';
import {useUserContext} from '../context/UserContext';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const {user, logoutUser} = useUserContext();

    const handleLogoutClick = async () => {
        try {
            logoutUser();
            navigate('/')

        } catch (error) {
            console.error('An error occurred during login:', error);
        }
    };

    return (
        <div className="navbar-container">
            <nav>
                <ul className="nav-list">
                    <li className="nav-item">
                        <Link to="/home" className="nav-link">
                            Home
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/inventory" className="nav-link">
                            Inventory
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/orders" className="nav-link">
                            Order
                        </Link>
                    </li>
                    {user.role === 'Admin' && <li className="nav-item">
                        <Link to="/user" className="nav-link">
                            User
                        </Link>
                    </li>
                    }
                </ul>
                <div className="logout-button">
                    <button onClick={handleLogoutClick}>Logout
                    </button>
                </div>
            </nav>

            <Outlet/>
        </div>
    )
        ;
};

export default Navbar;
