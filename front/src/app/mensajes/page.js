"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import styles from "./chat.module.css";

export default function ChatRoom() {
  const { id_chat } = useParams();
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const num_telefono = typeof window !== "undefined" ? localStorage.getItem("num_telefono") : null;

  useEffect(() => {
    async function cargarMensajes() {
      const res = await fetch(`http://localhost:4001/MensajesChat?id_chat=${id_chat}`);
      const data = await res.json();
      setMensajes(data.mensajes);
    }

    cargarMensajes();
  }, [id_chat]);

  const enviarMensaje = async () => {
    const res = await fetch("http://localhost:4001/EnviarMensaje", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_chat,
        num_telefono,
        contenido: nuevoMensaje,
      }),
    });

    const result = await res.json();
    if (result.enviado) {
      setMensajes((prev) => [...prev, result.mensaje]);
      setNuevoMensaje("");
    }
  };

  return (
    <div className={styles.chatContainer}>
      <h2>Chat</h2>
      <div className={styles.mensajes}>
        {mensajes.map((msg) => (
          <div key={msg.id_mensaje} className={msg.num_telefono === num_telefono ? styles.enviado : styles.recibido}>
            <p>{msg.contenido}</p>
            <span>{msg.fecha_envio}</span>
          </div>
        ))}
      </div>
      <div className={styles.inputContainer}>
        <input value={nuevoMensaje} onChange={(e) => setNuevoMensaje(e.target.value)} />
        <button onClick={enviarMensaje}>Enviar</button>
      </div>
    </div>
  );
}
