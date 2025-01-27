import React, { useEffect, useState } from "react";
import axios from "axios";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/users`);
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
      const response = await axios.put(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/whitelist/${userId}`);
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
