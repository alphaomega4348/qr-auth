import React, { useEffect, useState } from "react";
import axios from "axios";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("https://qr-auth-kwvfmo55c-alphaomega4348s-projects.vercel.app/api/users");
        setUsers(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching users:", error);
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Whitelist a user
  const handleWhitelist = async (userId) => {
    try {
      const response = await axios.put(`https://qr-auth-kwvfmo55c-alphaomega4348s-projects.vercel.app/api/whitelist/${userId}`);
      alert(response.data.message);

      // Update the UI to reflect the whitelist status
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, isWhitelisted: true } : user
        )
      );
    } catch (error) {
      alert(error.response?.data?.error || "Failed to whitelist user");
    }
  };

  if (loading) return <p>Loading users...</p>;

  return (
    <div>
      <h1>User List</h1>
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Whitelisted</th>
              <th>Scans</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.username}</td>
                <td>{user.isWhitelisted ? "Yes" : "No"}</td>
                <td>{user.scanCount}</td>
                <td>
                  {!user.isWhitelisted && (
                    <button onClick={() => handleWhitelist(user._id)}>
                      Whitelist
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserList;
