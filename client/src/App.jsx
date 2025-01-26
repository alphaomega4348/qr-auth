import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminScanner from "./components/AdminScanner";
import Whitelist from "./components/WhiteList";
import Register from "./components/Register";
import UserList from "./components/UserList";
import LoginRegisterToggle from "./components/LoginRegisterToggle";

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<LoginRegisterToggle/>} />
      <Route path="/admin-scanner" element={<AdminScanner />} />
      <Route path="/whitelist" element={<Whitelist />} />
      <Route path="/register" element={<Register />} />
      <Route path="/user-list" element={<UserList />} /> {/* New route for User List */}
    </Routes>
  </Router>
);

export default App;
