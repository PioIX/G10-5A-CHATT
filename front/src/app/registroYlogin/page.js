"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Mensaje from "@/components/Mensaje";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Contact from "@/components/Contact";
import styles from "./page.module.css";

export default function registroYlogin() {
  const [modo, setModo] = useState("login"); 
  const [nombre, setNombre] = useState("");
  const [numeroTelefono, setNumeroTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [modal, setModal] = useState({ open: false, title: "", message: "" });
  const router = useRouter();

  const showModal = (title, message) => {
    setModal({ open: true, title, message });
  };

  const closeModal = () => {
    setModal((prev) => ({ ...prev, open: false }));
  };

  async function ingresar() {
    const datosLogin = {
     numero_telefono: numeroTelefono, 
     password:password
    };

    try {
      const response = await fetch("http://localhost:4001/LoginUsuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosLogin),
      });

      const result = await response.json();
      console.log(result);

      if (result.res === true) {
        showModal("Éxito", "¡Has iniciado sesión correctamente!");
        router.push("/dashboard");
      } else {
        showModal("Error", result.message || "Credenciales incorrectas");
      }
    } catch (error) {
      console.error(error);
      showModal("Error", "Hubo un problema con la conexión al servidor.");
    }
  }

  async function registrar() {
    if (password !== confirmPassword) {
      showModal("Error", "Las contraseñas no coinciden");
      return;
    }

    const datosRegistro = {
      nombre,
      numero_telefono: numeroTelefono,
      password,
    };

    try {
      const response = await fetch("http://localhost:4001/RegistroUsuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosRegistro),
      });

      const result = await response.json();
      console.log(result);

      if (result.res === true) {
        showModal("Éxito", "¡Usuario registrado correctamente!");
        setTimeout(() => setModo("login"), 1000); 
      } else {
        showModal("Error", result.message || "No se pudo registrar el usuario");
      }
    } catch (error) {
      console.error(error);
      showModal("Error", "Hubo un problema con la conexión al servidor.");
    }
  }

  return (
    <div className={styles.container}>
      {modo === "login" ? (
        <>
          <h1>Iniciar sesión</h1>
          <Input
            type="text"
            placeholder="Teléfono"
            value={numeroTelefono}
            onChange={(e) => setNumeroTelefono(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button onClick={ingresar}>Ingresar</Button>
          <p>
            ¿No tenés cuenta?{" "}
            <button onClick={() => setModo("registro")}>Registrate</button>
          </p>
        </>
      ) : (
        <>
          <h1>Registrarse</h1>
          <Input
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <Input
            type="text"
            placeholder="Teléfono"
            value={numeroTelefono}
            onChange={(e) => setNumeroTelefono(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button onClick={registrar}>Registrarse</Button>
          <p>
            ¿Ya tenés cuenta?{" "}
            <button onClick={() => setModo("login")}>Inicia sesión</button>
          </p>
        </>
      )}

      {modal.open && (
        <Mensaje
          title={modal.title}
          message={modal.message}
          onClose={closeModal}
        />
      )}

      <Contact />
    </div>
  );
}
