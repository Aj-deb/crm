const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const token = () => localStorage.getItem("token");

// Fetch all users
export async function fetchUsers() {
  const res = await fetch(`${API_BASE}/users`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
  if (!res.ok) throw new Error("Failed to load users");
  return await res.json();
}

// Fetch user profile (for drawer)
export async function fetchUserProfile(id) {
  const res = await fetch(`${API_BASE}/users/${id}`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
  if (!res.ok) throw new Error("Failed to fetch user profile");
  return await res.json();
}

// Update role or status
export async function updateUserRoleStatus(id, body) {
  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token()}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to update user");
  return await res.json();
}

// Deactivate user
export async function deactivateUser(id) {
  const res = await fetch(`${API_BASE}/users/${id}/deactivate`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token()}` },
  });
  if (!res.ok) throw new Error("Failed to deactivate user");
  return await res.json();
}
