import React, { useState } from "react";
import Login from "./Login";
import Register from "./Register";

const LoginRegisterToggle = () => {
  const [isLogin, setIsLogin] = useState(true); // State to toggle between Login and Register

  const toggleForm = () => {
    setIsLogin(!isLogin); // Switch between Login and Register
  };

  return (
    <div className="auth-container">
      {isLogin ? <Login /> : <Register />}
      <button className="toggle-button" onClick={toggleForm}>
        {isLogin ? "Switch to Register" : "Switch to Login"}
      </button>
    </div>
  );
};

export default LoginRegisterToggle;
