import React, {useState, useEffect} from 'react';
import './Inventory.css';
import {useUserContext} from '../context/UserContext';


const Inventory = () => {
    const {user} = useUserContext();
    const [products, setProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('');
    const [modalData, setModalData] = useState({
        product_name: '',
        quantity: '',
        color: '',
        size: '',
        gender: '',
        price: '',
        category: '',
        history: '',
    });
    const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);
    const [quantityModalProduct, setQuantityModalProduct] = useState(null);
    const [quantity, setQuantity] = useState(0);
    const [quantityAction, setQuantityAction] = useState('');
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [orderProducts, setOrderProducts] = useState([]);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch('http://127.0.0.1:5000/api/getAllProducts');
            if (response.ok) {
                const data = await response.json();
                setProducts(data.products);
            } else {
                console.error('Failed to fetch products');
            }
        } catch (error) {
            console.error('An error occurred during product data fetch:', error);
        }
    };

    const handleModalOpen = (mode, data = {}) => {
        setIsModalOpen(true);
        setModalMode(mode);
        setModalData(data);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setModalMode('');
        setModalData({
            product_name: '',
            quantity: '',
            color: '',
            size: '',
            gender: '',
            price: '',
            category: '',
            history: '',
        });
    };

    const handleModalSave = async () => {
        try {
            let apiUrl = '';
            let method = '';

            if (modalMode === 'add') {
                apiUrl = 'http://127.0.0.1:5000/api/insertData';
                method = 'POST';
            } else if (modalMode === 'edit') {
                apiUrl = `http://127.0.0.1:5000/api/updateProduct/${modalData.product_id}`;
                method = 'PUT';
            }

            const payload =
                modalMode === 'add'
                    ? {...modalData, history: ''} // Set history to an empty string for 'add'
                    : {...modalData}; // For 'edit', use the existing data without modifying history

            const response = await fetch(apiUrl, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                alert('Product saved successfully')
                console.log('Product saved successfully');
                fetchProducts();
                handleModalClose();
            } else {
                console.error('Failed to save product');
            }
        } catch (error) {
            console.error('An error occurred during product save:', error);
        }
    };

    const handleQuantityModalOpen = (product, action) => {
        setQuantityModalProduct(product);
        setQuantity(0);
        setIsQuantityModalOpen(true);
        setQuantityAction(action)
    };

    const handleQuantityModalClose = () => {
        setQuantityModalProduct(null);
        setIsQuantityModalOpen(false);
        setQuantity(0);
        setQuantityAction('')
    };

    const handleQuantityModalSave = async () => {
        try {
            const apiUrl = `http://127.0.0.1:5000/api/updateQuantity/${quantityModalProduct.product_id}`;

            const payload = {
                quantity: quantity,
                action: quantityAction,
            };

            const response = await fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                alert('Quantity updated successfully')
                console.log('Quantity updated successfully');
                fetchProducts();
                handleQuantityModalClose();
            } else {
                console.error('Failed to update quantity');
            }
        } catch (error) {
            console.error('An error occurred during quantity update:', error);
        }
    };

    const handleDelete = async (productId) => {
        try {
            const apiUrl = `http://127.0.0.1:5000/api/deleteProduct/${productId}`;

            const response = await fetch(apiUrl, {
                method: 'DELETE',
            });

            if (response.ok) {
                alert('Product deleted successfully')
                console.log('Product deleted successfully');
                fetchProducts();
            } else {
                console.error('Failed to delete product');
            }
        } catch (error) {
            console.error('An error occurred during product deletion:', error);
        }
    };

    const handleOrderModalOpen = () => {
        setOrderProducts(products.filter(product => product.quantity > 0));
        setIsOrderModalOpen(true);
    };

    // Function to close order modal
    const handleOrderModalClose = () => {
        setIsOrderModalOpen(false);
        setOrderProducts([]);
    };

    // Function to submit order
    const handleOrderSubmit = async () => {
        try {
            const validOrderProducts = orderProducts.filter(product => product.orderQuantity !== undefined && product.orderQuantity > 0);

            const productIdsWithNonZeroQuantity = validOrderProducts.map(product => product.product_id);

            const nonZeroOrderedItems = validOrderProducts.map(product => ({
                product_id: product.product_id,
                orderQuantity: product.orderQuantity,
            }));

            console.log(nonZeroOrderedItems)
            console.log(products)

            for (const { product_id, orderQuantity } of nonZeroOrderedItems) {
                const product = products.find(product => product.product_id === product_id);
                const availableQuantity = product?.quantity || 0;

                if (orderQuantity > availableQuantity) {
                    alert(`Invalid quantity entered for product named ${product.product_name}. Ordered quantity exceeds available quantity.`);
                    throw new Error(`Invalid quantity entered for product named ${product.product_name}. Ordered quantity exceeds available quantity.`)
                }
            }

            const totalPrice = validOrderProducts.reduce((total, product) => {
                return total + product.price * product.orderQuantity;
            }, 0);

            const orderPayload = {
                user_id: user.id,
                user_order: {
                    products: orderProducts.map(product => ({
                        product_id: product.product_id,
                        product_name: product.product_name,
                        price: product.price,
                        quantity: product.orderQuantity,
                    })),
                },
                price: totalPrice,
            };

            const apiUrl = 'http://127.0.0.1:5000/api/addOrder';
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderPayload),
            });

            if (response.ok) {
                alert('Order placed successfully');
                for (const productId of productIdsWithNonZeroQuantity) {
                    const updateQuantityUrl = `http://127.0.0.1:5000/api/updateQuantity/${productId}`;
                    const updateQuantityPayload = {
                        quantity: validOrderProducts.find(product => product.product_id === productId).orderQuantity,
                        action: 'remove',
                    };

                    const updateQuantityResponse = await fetch(updateQuantityUrl, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(updateQuantityPayload),
                    });

                    if (updateQuantityResponse.ok) {
                        alert(`Quantity for product ${productId} updated successfully`)
                        console.log(`Quantity for product ${productId} updated successfully`);
                    } else {
                        console.error(`Failed to update quantity for product ${productId}`);
                    }
                }
                fetchProducts();
                handleOrderModalClose();
            } else {
                console.error('Failed to place order');
            }
        } catch (error) {
            console.error('An error occurred during order placement:', error);
        }
    };

    return (
        <div className="inventory-container">
            <div className="row">
                <div className="column">
                    <h2>Inventory Page</h2>
                </div>
                <div className="column">
                    {user && user.role && user.role === "Admin" && <button onClick={() => handleModalOpen('add')}>
                        Add Product
                    </button>
                    }
                    {user && user.role &&  user.role !== "Admin" && <button onClick={handleOrderModalOpen}>
                        Order
                    </button>
                    }
                </div>
            </div>
            <table className="inventory-table">
                <thead>
                <tr>
                    <th>Product Name</th>
                    <th>Quantity</th>
                    <th>Color</th>
                    <th>Size</th>
                    <th>Gender</th>
                    <th>Price</th>
                    <th>Category</th>
                    <th>History</th>
                    {user && user.role && user.role === "Admin" && <th>Actions</th>}
                </tr>
                </thead>
                <tbody>
                {products.map((product) => (
                    <tr key={product.product_id}>
                        <td>{product.product_name}</td>
                        <td>
                            <td>
                                {product.quantity}
                            </td>
                            {user && user.role && user.role === "Admin" && ( <td>
                                    <td>
                                    <button onClick={() => handleQuantityModalOpen(product, 'add')}>
                                        Add
                                    </button>
                                    </td>
                                    <td>
                                        <button onClick={() => handleQuantityModalOpen(product, 'remove')}>
                                        Remove
                                    </button>
                                    </td>
                                </td>
                            )}
                        </td>
                        <td>{product.color}</td>
                        <td>{product.size}</td>
                        <td>{product.gender}</td>
                        <td>{product.price}</td>
                        <td>{product.category}</td>
                        <td className="history">{product.history}</td>
                        {user && user.role && user.role === "Admin" && <td>
                            <td>
                                <button className="action-button"
                                        onClick={() => handleModalOpen('edit', product)}>Edit
                                </button>
                            </td>
                            <td>
                                <button className="action-button"
                                        onClick={() => handleDelete(product.product_id)}>Delete
                                </button>
                            </td>
                        </td>
                        }
                    </tr>
                ))}
                </tbody>
            </table>

            {isModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={handleModalClose}>
                            &times;
                        </span>
                        <h2>{modalMode === 'add' ? 'Add Product' : 'Edit Product'}</h2>
                        <form>
                            <label>
                                Product Name:
                                <input
                                    type="text"
                                    value={modalData.product_name}
                                    onChange={(e) =>
                                        setModalData({
                                            ...modalData,
                                            product_name: e.target.value,
                                        })
                                    }
                                />
                            </label>

                            {/* Add other input fields similarly */}
                            <label>
                                Quantity:
                                <input
                                    type="number"
                                    value={modalData.quantity}
                                    onChange={(e) =>
                                        setModalData({
                                            ...modalData,
                                            quantity: e.target.value,
                                        })
                                    }
                                />
                            </label>

                            <label>
                                Color:
                                <input
                                    type="text"
                                    value={modalData.color}
                                    onChange={(e) =>
                                        setModalData({
                                            ...modalData,
                                            color: e.target.value,
                                        })
                                    }
                                />
                            </label>

                            <label>
                                Size:
                                <input
                                    type="text"
                                    value={modalData.size}
                                    onChange={(e) =>
                                        setModalData({
                                            ...modalData,
                                            size: e.target.value,
                                        })
                                    }
                                />
                            </label>

                            <label>
                                Gender:
                                <input
                                    type="text"
                                    value={modalData.gender}
                                    onChange={(e) =>
                                        setModalData({
                                            ...modalData,
                                            gender: e.target.value,
                                        })
                                    }
                                />
                            </label>

                            <label>
                                Price:
                                <input
                                    type="number"
                                    value={modalData.price}
                                    onChange={(e) =>
                                        setModalData({
                                            ...modalData,
                                            price: e.target.value,
                                        })
                                    }
                                />
                            </label>

                            <label>
                                Category:
                                <input
                                    type="text"
                                    value={modalData.category}
                                    onChange={(e) =>
                                        setModalData({
                                            ...modalData,
                                            category: e.target.value,
                                        })
                                    }
                                />
                            </label>

                            {/* Add more input fields... */}

                            <button type="button" onClick={handleModalSave}>
                                Save
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {isQuantityModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={handleQuantityModalClose}>
                            &times;
                        </span>
                        <h2>Update Quantity</h2>
                        <label>
                            Quantity:
                            <input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                            />
                        </label>
                        <button onClick={handleQuantityModalSave}>Save</button>
                    </div>
                </div>
            )}

            {isOrderModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={handleOrderModalClose}>
                            &times;
                        </span>
                        <h2>Place Order</h2>
                        <form>
                            <table>
                                <thead>
                                <tr>
                                    <th>Product Name</th>
                                    <th>Available Quantity</th>
                                    <th>Order Quantity</th>
                                </tr>
                                </thead>
                                <tbody>
                                {orderProducts.map(product => (
                                    <tr key={product.product_id}>
                                        <td>{product.product_name}</td>
                                        <td>{product.quantity}</td>
                                        <td>
                                            <input
                                                type="number"
                                                value={product.orderQuantity || 0}
                                                onChange={(e) => {
                                                    const quantity = parseInt(e.target.value, 10) || 0;
                                                    setOrderProducts(prevProducts =>
                                                        prevProducts.map(prevProduct =>
                                                            prevProduct.product_id === product.product_id
                                                                ? {...prevProduct, orderQuantity: quantity}
                                                                : prevProduct
                                                        )
                                                    );
                                                }}
                                            />
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>

                            <button type="button" onClick={handleOrderSubmit}>
                                Place Order
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;
