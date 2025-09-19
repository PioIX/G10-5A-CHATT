"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../chat/page.module.css";

export default function ChatList() {
  const [contactos, setContactos] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const num_telefono = typeof window !== "undefined" ? localStorage.getItem("num_telefono") : null;

    async function cargarContactos() {
      const res = await fetch(`http://localhost:4001/ContactosUsuario?num_telefono=${num_telefono}`);
      const data = await res.json();
      setContactos(data.contactos);
    }

    if (num_telefono) {
      cargarContactos();
    } else {
      router.push("/");
    }
  }, []); // Solo al montar

  const abrirChat = async (telefonoContacto) => {
    const num_telefono = typeof window !== "undefined" ? localStorage.getItem("num_telefono") : null;
    const res = await fetch(`http://localhost:4001/BuscarChat?usuario1=${num_telefono}&usuario2=${telefonoContacto}`);
    const data = await res.json();
    if (data.id_chat) {
      router.push(`/chat/${data.id_chat}`);
    } else {
      alert("No se encontró el chat");
    }
  };

  return (
    <div className={styles.container}>
      <h1>Contactos</h1>
      <ul className={styles.lista}>
        {contactos.map((contacto) => (
          <li key={contacto.num_telefono} className={styles.contacto} onClick={() => abrirChat(contacto.num_telefono)}>
            <img src={contacto.foto_perfil || "/default.jpg"} alt="Foto" className={styles.foto} />
            <span>{contacto.nombre}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}