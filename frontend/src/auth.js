// src/api/auth.js
export const loginUser = async (email, password, role) => {
  try {
    const res = await fetch("http://localhost:4000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, role }),
    });

    const data = await res.json();

    if (res.ok) {
      // ✅ Save token and user info in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      alert("Login Successful!");
    } else {
      alert(data.message || "Login Failed");
    }

    return data;
  } catch (err) {
    console.error("Login Error:", err);
  }
};
