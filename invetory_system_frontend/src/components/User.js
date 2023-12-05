import React, {useState, useEffect} from 'react';
import Modal from 'react-modal';
import './User.css';

const User = () => {
    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [field, setField] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({
        email: '',
        password: '',
        name: '',
        role: '',
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch('http://127.0.0.1:5000/api/getAllUsers');
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            } else {
                console.error('Failed to fetch users');
            }
        } catch (error) {
            console.error('An error occurred during user data fetch:', error);
        }
    };

    const handleEditClick = (user, field) => {
        setEditingUser(user);
        setEditValue(user[field]);
        setField(field)
    };

    const handleEditSave = async () => {
        const fieldToUpdate = field;
        const payload = {[fieldToUpdate]: editValue};

        try {
            const response = await fetch(`http://127.0.0.1:5000/api/updateUser/${editingUser.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                alert(`${fieldToUpdate} updated successfully`)
                console.log(`${fieldToUpdate} updated successfully`);
                fetchUsers();
            } else {
                console.error(`Failed to update ${fieldToUpdate}`);
            }
        } catch (error) {
            console.error(`An error occurred during ${fieldToUpdate} update:`, error);
        }

        setField(null)
        setEditingUser(null);
        setEditValue('');
    };

    const handleEditCancel = () => {
        setEditingUser(null);
        setEditValue('');
    };

    const handleModalOpen = () => {
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        // Reset new user fields after closing modal
        setNewUser({
            email: '',
            password: '',
            name: '',
            role: '',
        });
    };

    const handleAddUser = async () => {
        try {
            const response = await fetch('http://127.0.0.1:5000/api/addUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newUser),
            });

            if (response.ok) {
                alert('User added successfully')
                console.log('User added successfully');
                fetchUsers();
                handleModalClose();
            } else {
                console.error('Failed to add user');
            }
        } catch (error) {
            console.error('An error occurred during user addition:', error);
        }
    };

    const handleDeleteClick = async (userId) => {
        try {
            const response = await fetch(`http://127.0.0.1:5000/api/deleteUser/${userId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                alert(`User with ID ${userId} deleted successfully`)
                console.log(`User with ID ${userId} deleted successfully`);
                fetchUsers(); // Refresh the user list after deletion
            } else {
                console.error(`Failed to delete user with ID ${userId}`);
            }
        } catch (error) {
            console.error('An error occurred during user deletion:', error);
        }
    };

    return (
        <div className="user-container">
            <div className="row">
                <div className="column">
                    <h2>User Page</h2>
                </div>
                <div className="column">
                    <button className="add-user-button" onClick={handleModalOpen}>
                        Add User
                    </button>
                </div>
            </div>
            <table className="user-table">
                <thead>
                <tr>
                    <th>Email</th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Password</th>
                    <th>Action</th>
                </tr>
                </thead>
                <tbody>
                {users.map((user) => (
                    <tr key={user.id}>
                        <td>{user.email}</td>
                        <td>
                            <td>
                                {editingUser === user ? (
                                    <input
                                        type="text"
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                    />
                                ) : (
                                    user.name
                                )}
                            </td>
                            <td>
                                <button
                                    className="action-button"
                                    onClick={() => handleEditClick(user, 'name')}
                                >
                                    Edit
                                </button>
                            </td>
                        </td>
                        <td>{user.role}</td>
                        <td>
                            <td>
                                {editingUser === user ? (
                                    <input
                                        type="password"
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                    />
                                ) : (
                                    user.password
                                )}
                            </td>
                            <td>
                                <button
                                    className="action-button"
                                    onClick={() => handleEditClick(user, 'password')}
                                >
                                    Edit
                                </button>
                            </td>
                        </td>
                        <td>
                            <button
                                className="action-button"
                                onClick={() => handleDeleteClick(user.id)}
                            >
                                Delete
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {editingUser && (
                <div className="edit-popup">
                    <button onClick={handleEditSave}>Save</button>
                    <button onClick={handleEditCancel}>Cancel</button>
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onRequestClose={handleModalClose}
                contentLabel="Add User Modal"
            >
                <h2>Add User</h2>
                <form>
                    <label>Email:</label>
                    <input
                        type="text"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    />

                    <label>Password:</label>
                    <input
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    />

                    <label>Name:</label>
                    <input
                        type="text"
                        value={newUser.name}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    />

                    <label>Role:</label>
                    <input
                        type="text"
                        value={newUser.role}
                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    />

                    <button type="button" onClick={handleAddUser}>
                        Add
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default User;
