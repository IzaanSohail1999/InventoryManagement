import React, {useState} from 'react';
import {BrowserRouter, Routes, Route} from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import User from "./components/User";
import LoginPage from "./components/LoginPage"
import Inventory from "./components/Inventory";
import Orders from "./components/Orders";
import {useUserContext} from './context/UserContext';

const App = () => {
    const {user} = useUserContext();

    return (
        <BrowserRouter>
            {user && <Navbar/>}
            <Routes>
                <Route path="/" element={<LoginPage/>}/>
                <Route path="home" element={<Home/>}/>
                <Route path="user" element={<User/>}/>
                <Route path="inventory" element={<Inventory/>}/>
                <Route path="orders" element={<Orders/>}/>
            </Routes>
        </BrowserRouter>
    );
};

export default App;
