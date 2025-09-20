"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Mensaje from "@/components/Mensaje";
import Contact from "@/components/Contact";
import styles from "./page.module.css";

export default function RegistroYLogin() {
  const [modo, setModo] = useState("login");
  const [nombre, setNombre] = useState("");
  const [mail, setMail] = useState("");
  const [num_telefono, setNumTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [foto_perfil, setlinkFoto] = useState("");
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
      num_telefono: num_telefono,
      contraseña: password,
    };

    try {
      const response = await fetch("http://localhost:4001/LoginUsuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosLogin),
      });

      const result = await response.json();
      console.log(result);

     
      if (result.loguea) {
      
        alert("Éxito", "¡Has iniciado sesión correctamente!");
        localStorage.setItem("idLogged",response.idLogged);
        router.push("/home");
      } else {
        alert("Error", result.res || "Credenciales incorrectas");
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
      nombre:nombre,
      num_telefono: num_telefono,
      contraseña: password,
      mail:mail,
      foto_perfil: foto_perfil,
    };

    console.log(datosRegistro);

    try {
      const response = await fetch("http://localhost:4001/RegistroUsuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosRegistro),
      });

      const result = await response.json();
      console.log(result);

      if (result.registro) {
        alert("Éxito", "¡Usuario registrado correctamente!");
        localStorage.setItem("idLogged", response.idLogged);
        setTimeout(() => setModo("login"), 1000);
        router.push("/home");
      } else {
        showModal("Error", result.res || "No se pudo registrar el usuario");
      }
    } catch (error) {
      console.error(error);
      showModal("Error", "Hubo un problema con la conexión al servidor.");
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        {modo === "login" ? (
          <>
            <h1 className={styles.titulo}>Iniciar sesión</h1>
            <input
              className={styles.input}
              type="text"
              placeholder="Teléfono"
              value={num_telefono}
              onChange={(e) => setNumTelefono(e.target.value)}
            />
            <input
              className={styles.input}
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className={styles.botonAccion} onClick={ingresar}>
              Ingresar
            </button>
            <p className={styles.textoCambioModo}>
              ¿No tenés cuenta?{" "}
              <button
                className={styles.botonCambioModo}
                onClick={() => setModo("registro")}
              >
                Registrate
              </button>
            </p>
          </>
        ) : (
          <>
            <h1 className={styles.titulo}>Registrarse</h1>
            <input
              className={styles.input}
              type="text"
              placeholder="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
            <input
              className={styles.input}
              type="text"
              placeholder="Teléfono"
              value={num_telefono}
              onChange={(e) => setNumTelefono(e.target.value)}
            />
            <input
              className={styles.input}
              type="text"
              placeholder="Mail"
              value={mail}
              onChange={(e) => setMail(e.target.value)}
            />
            <input
              className={styles.input}
              type="text"
              placeholder="Link de foto"
              value={foto_perfil}
              onChange={(e) => setlinkFoto(e.target.value)}
            />
            <input
              className={styles.input}
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              className={styles.input}
              type="password"
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button className={styles.botonAccion} onClick={registrar}>
              Registrarse
            </button>
            <p className={styles.textoCambioModo}>
              ¿Ya tenés cuenta?{" "}
              <button
                className={styles.botonCambioModo}
                onClick={() => setModo("login")}
              >
                Inicia sesión
              </button>
            </p>
          </>
        )}
      </div>

      {modal.open && (
        <Mensaje
          className={styles.mensaje}
          title={modal.title}
          message={modal.message}
          onClose={closeModal}
        />
      )}

      <Contact />
    </div>
  );
}