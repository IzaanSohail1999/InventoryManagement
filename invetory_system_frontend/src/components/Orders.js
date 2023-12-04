// Orders.js

import React, { useState, useEffect } from 'react';
import { useUserContext } from '../context/UserContext';
import './Orders.css'; // Import the CSS file

const Orders = () => {
    const { user } = useUserContext();
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:5000/api/getAllOrders`);
            if (response.ok) {
                const data = await response.json();
                setOrders(data);
            } else {
                console.error('Failed to fetch orders');
            }
        } catch (error) {
            console.error('An error occurred during order data fetch:', error);
        }
    };

    return (
        <div className="orders-container">
            <h2 className="orders-heading">Orders Page</h2>
            <div className="orders-table-container">
                <table className="orders-table">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>User ID</th>
                        <th>User Order</th>
                        <th>Price</th>
                    </tr>
                    </thead>
                    <tbody>
                    {orders
                        .filter((order) => user.id === order.user_id)
                        .map((order) => (
                            <tr key={order.id}>
                                <td>{order.id}</td>
                                <td>{order.user_id}</td>
                                <td>
                                    <ul className="orders-list">
                                        {JSON.parse(order.user_order).products.map((product) => (
                                            <li key={product.product_id}>
                                                <td>
                                                    {product.product_name} - ${product.price}
                                                </td>
                                                <td>
                                                    Quantity - {product.quantity ?? 0}
                                                </td>
                                            </li>
                                        ))}
                                    </ul>
                                </td>
                                <td>${order.price}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Orders;
