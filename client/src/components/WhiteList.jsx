import React, { useState } from "react";
import axios from "axios";

const Whitelist = () => {
  const [userId, setUserId] = useState("");

  const handleWhitelist = async () => {
    try {
      const response = await axios.put(`https://qr-auth-kwvfmo55c-alphaomega4348s-projects.vercel.app/api/whitelist/${userId}`);
      alert(response.data.status);
    } catch (error) {
      alert(error.response?.data?.error || "Whitelist failed");
    }
  };

  return (
    <div>
      <h1>Whitelist User</h1>
      <input
        type="text"
        placeholder="User ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />
      <button onClick={handleWhitelist}>Whitelist</button>
    </div>
  );
};

export default Whitelist;
