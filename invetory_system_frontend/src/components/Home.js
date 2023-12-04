import React from 'react';

const Home = () => {
    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Inventory Management System</h2>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh', // Adjust the height as needed
    },
    title: {
        textAlign: 'center',
    },
};

export default Home;
