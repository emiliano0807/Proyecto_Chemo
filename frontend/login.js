const API_LOGIN_URL = "http://localhost:3000/api/login";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const usuario = document.getElementById("usuario").value.trim();
  const contrasena = document.getElementById("contrasena").value;

  try {
    const res = await fetch(API_LOGIN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario, contrasena }),
    });

    if (!res.ok) throw new Error("Credenciales incorrectas");

    const data = await res.json();
    localStorage.setItem("usuario", JSON.stringify(data)); // Guarda usuario y rol

    // Redirecciona al inicio
    window.location.href = "index.html";
  } catch (err) {
    alert(err.message);
  }
});
