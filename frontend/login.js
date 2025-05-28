const API_LOGIN_URL = "http://localhost:3000/api/login";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const usuario = document.getElementById("usuario").value.trim();
  const contrasena = document.getElementById("contrasena").value;
  const errorMessage = document.getElementById("errorMessage");

  try {
    const res = await fetch(API_LOGIN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario, contrasena }),
    });

    if (!res.ok) throw new Error("Credenciales incorrectas");

    const data = await res.json();
    localStorage.setItem("usuario", JSON.stringify(data));

    // Redirección según el rol
    if (data.rol === "admin") {
      window.location.href = "index.html";
    } else {
      window.location.href = "index.html";
    }
  } catch (err) {
    errorMessage.textContent = err.message;
    errorMessage.style.display = "block";
  }
});

// Ocultar error al escribir
document.getElementById("usuario").addEventListener("input", () => {
  document.getElementById("errorMessage").style.display = "none";
});
document.getElementById("contrasena").addEventListener("input", () => {
  document.getElementById("errorMessage").style.display = "none";
});

// Permitir login con Enter
document.getElementById("contrasena").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    document.querySelector("button[type='submit']").click();
  }
});
