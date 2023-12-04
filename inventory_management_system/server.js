const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: 'inventory_management'
});

const app = express();
app.use(express.json());
app.use(cors());

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});

app.post('/api/insertData', (req, res) => {
    const {product_name, quantity, color, size, gender, price, history, category} = req.body;

    if (!product_name || !quantity || !price || !category) {
        return res.status(400).json({error: 'Mandatory Fields are Missing.'});
    }

    con.query('SELECT * FROM inventory WHERE product_name = ?', [product_name], (selectErr, selectResult) => {
        if (selectErr) {
            console.error(selectErr);
            return res.status(500).json({error: 'Internal Server Error'});
        }

        if (selectResult.length > 0) {
            return res.status(409).json({error: 'Item with this product_name already exists.'});
        }

        const newItem = {
            product_name,
            quantity,
            color,
            size,
            gender,
            price,
            history,
            category,
            created_at: new Date()
        };

        con.query('INSERT INTO inventory SET ?', newItem, (insertErr, result) => {
            if (insertErr) {
                console.error(insertErr);
                return res.status(500).json({error: 'Internal Server Error'});
            }

            console.log('Item added to the inventory:', result);
            res.status(201).json({message: 'Item added successfully', newItem});
        });
    });
});

app.put('/api/updateQuantity/:productId', (req, res) => {
    let { quantity, action } = req.body;
    const productId = req.params.productId;

    if (!quantity || !action) {
        return res.status(400).json({ error: 'Quantity and action are required.' });
    }

    let historyMessage = '';

    if (action === 'add') {
        historyMessage = `Added ${quantity} items at ${new Date()}.`;
    } else if (action === 'remove') {
        historyMessage = `Removed ${quantity} items at ${new Date()}.`;
        // In case of "remove" action, subtract the quantity
        quantity = -quantity;
    } else {
        return res.status(400).json({ error: 'Invalid action. Use "add" or "remove".' });
    }

    const updateQuery = 'UPDATE inventory SET quantity = quantity + ?, history = CONCAT(history, ?), updated_at = ? WHERE product_id = ?';

    con.query(updateQuery, [quantity, `\n${historyMessage}\n`, new Date(), productId], (updateErr, updateResult) => {
        if (updateErr) {
            console.error(updateErr);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        console.log('Quantity updated in the inventory:', updateResult);
        res.status(200).json({ message: 'Quantity updated successfully' });
    });
});

app.put('/api/updateProduct/:productId', (req, res) => {
    const productId = parseInt(req.params.productId, 10);
    const updatedFields = req.body;

    let setClause = Object.keys(updatedFields).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updatedFields);

    setClause += ', updated_at = ?';
    values.push(new Date());

    const updateQuery = `UPDATE inventory SET ${setClause} WHERE product_id = ?`;

    con.query(updateQuery, [...values, productId], (updateErr, updateResult) => {
        if (updateErr) {
            console.error(updateErr);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        console.log('Product updated in the inventory:', updateResult);
        res.status(200).json({ message: 'Product updated successfully' });
    });
});

app.get('/api/getAllProducts', (req, res) => {
    const getAllProductsQuery = 'SELECT * FROM inventory';

    con.query(getAllProductsQuery, (queryErr, queryResult) => {
        if (queryErr) {
            console.error(queryErr);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        console.log('Fetched all products from the inventory:', queryResult);
        res.status(200).json({ products: queryResult });
    });
});

app.get('/api/getProduct', (req, res) => {
    const filterColumn = req.query.column;
    const filterValue = req.query.value;

    if (!filterColumn || !filterValue) {
        return res.status(400).json({ error: 'Both column and value are required for filtering.' });
    }

    const getProductByFilterQuery = `SELECT * FROM inventory WHERE ${filterColumn} = ?`;

    con.query(getProductByFilterQuery, [filterValue], (queryErr, queryResult) => {
        if (queryErr) {
            console.error(queryErr);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (queryResult.length === 0) {
            return res.status(404).json({ error: 'No products found with the specified filter.' });
        }

        console.log(`Fetched product(s) by ${filterColumn} from the inventory:`, queryResult);
        res.status(200).json({ products: queryResult });
    });
});

app.delete('/api/deleteProduct/:productId', (req, res) => {
    const productId = parseInt(req.params.productId, 10);

    const deleteProductQuery = 'DELETE FROM inventory WHERE product_id = ?';

    con.query(deleteProductQuery, [productId], (deleteErr, deleteResult) => {
        if (deleteErr) {
            console.error(deleteErr);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (deleteResult.affectedRows === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        console.log(`Deleted product with ID ${productId} from the inventory.`);
        res.status(200).json({ message: 'Product deleted successfully' });
    });
});

app.post('/api/addUser', (req, res) => {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name || !role) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const checkEmailQuery = 'SELECT * FROM user WHERE email = ?';

    con.query(checkEmailQuery, [email], (checkErr, checkResult) => {
        if (checkErr) {
            console.error(checkErr);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (checkResult.length > 0) {
            return res.status(409).json({ error: 'Email already exists. Please use a different email.' });
        }

        const newUser = {
            email,
            password,
            name,
            role
        };

        const insertUserQuery = 'INSERT INTO user SET ?';

        con.query(insertUserQuery, newUser, (insertErr, result) => {
            if (insertErr) {
                console.error(insertErr);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            console.log('User added to the database:', result);
            res.status(201).json({ message: 'User added successfully', newUser });
        });
    });
});

app.put('/api/updateUser/:userId', (req, res) => {
    const userId = req.params.userId;
    const { name, password } = req.body;

    if (!name && !password) {
        return res.status(400).json({ error: 'Name or password is required for updating.' });
    }

    let setClause = '';
    const values = [];

    if (name) {
        setClause += 'name = ?, ';
        values.push(name);
    }

    if (password) {
        setClause += 'password = ?, ';
        values.push(password);
    }

    setClause = setClause.slice(0, -2);

    values.push(userId);

    const updateUserQuery = `UPDATE user SET ${setClause} WHERE id = ?`;

    con.query(updateUserQuery, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        console.log(`User with ID ${userId} updated in the database.`);
        res.status(200).json({ message: 'User updated successfully' });
    });
});

app.get('/api/getAllUsers', (req, res) => {
    const getAllUsersQuery = 'SELECT * FROM user';

    con.query(getAllUsersQuery, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        res.status(200).json(result);
    });
});

app.get('/api/getUsers', (req, res) => {
    const { id, name, email } = req.query;

    let whereClause = '';
    const values = [];

    if (id) {
        whereClause += 'id = ? AND ';
        values.push(id);
    }

    if (name) {
        whereClause += 'name = ? AND ';
        values.push(name);
    }

    if (email) {
        whereClause += 'email = ? AND ';
        values.push(email);
    }

    if (whereClause) {
        whereClause = 'WHERE ' + whereClause.slice(0, -5);
    }

    const getUsersQuery = `SELECT * FROM user ${whereClause}`;

    con.query(getUsersQuery, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        res.status(200).json(result);
    });
});

app.delete('/api/deleteUser/:userId', (req, res) => {
    const userId = req.params.userId;

    const deleteUserQuery = 'DELETE FROM user WHERE id = ?';

    con.query(deleteUserQuery, [userId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        console.log(`User with ID ${userId} deleted from the database.`);
        res.status(200).json({ message: 'User deleted successfully' });
    });
});

app.post('/api/addOrder', (req, res) => {
    const { user_id, user_order, price } = req.body;

    if (!user_id || !user_order || !price) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const addOrderQuery = 'INSERT INTO client_order (user_id, user_order, price) VALUES (?, ?, ?)';

    con.query(addOrderQuery, [user_id, JSON.stringify(user_order), price], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        console.log('Order added to the database:', result);
        res.status(201).json({ message: 'Order added successfully' });
    });
});

app.put('/api/updateOrder/:orderId', (req, res) => {
    const orderId = req.params.orderId;
    const { user_id, user_order, price } = req.body;

    if (!user_id || !user_order || !price) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const updateOrderQuery = 'UPDATE client_order SET user_id = ?, user_order = ?, price = ? WHERE id = ?';

    con.query(updateOrderQuery, [user_id, JSON.stringify(user_order), price, orderId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        console.log(`Order with ID ${orderId} updated in the database.`);
        res.status(200).json({ message: 'Order updated successfully' });
    });
});

app.get('/api/getAllOrders', (req, res) => {
    const getAllOrdersQuery = 'SELECT * FROM client_order';

    con.query(getAllOrdersQuery, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        res.status(200).json(result);
    });
});

app.get('/api/getOrders', (req, res) => {
    const { userId, orderId, orderByPrice } = req.query;

    let getOrdersQuery = 'SELECT * FROM client_order';
    const values = [];

    let whereClause = '';
    if (userId) {
        whereClause += 'user_id = ? AND ';
        values.push(userId);
    }

    if (orderId) {
        whereClause += 'id = ? AND ';
        values.push(orderId);
    }

    if (whereClause) {
        whereClause = 'WHERE ' + whereClause.slice(0, -5);
    }

    if (orderByPrice) {
        const sortOrder = orderByPrice.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
        getOrdersQuery += ` ${whereClause} ORDER BY price ${sortOrder}`;
    } else {
        getOrdersQuery += ` ${whereClause}`;
    }

    con.query(getOrdersQuery, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        res.status(200).json(result);
    });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    const loginQuery = 'SELECT * FROM user WHERE email = ? AND password = ?';

    con.query(loginQuery, [email, password], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (result.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }
        const user = result[0];

        const userResponse = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        };
        res.status(200).json({ message: 'Login successful', user: userResponse });
    });
});

app.listen(5000, () => {
    console.log(`Server is running on port 5000.`);
});