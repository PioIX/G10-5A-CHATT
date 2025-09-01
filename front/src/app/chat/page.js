"use client";

import { useState } from "react";
import Mensaje from "@/components/Mensaje";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Contact from "@/components/Contact";
import styles from "./page.module.css";

export default function ChatPage() {
  const [mensajes, setMensajes] = useState([
    { texto: "Hola Sofi 👋", hora: "10:00", tipo: "recibido" },
    { texto: "¿Todo bien?", hora: "10:01", tipo: "recibido" },
  ]);

  const [nuevoMensaje, setNuevoMensaje] = useState("");

  const enviarMensaje = () => {
    if (!nuevoMensaje.trim()) return;
    setMensajes([
      ...mensajes,
      { texto: nuevoMensaje, hora: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), tipo: "enviado" }
    ]);
    setNuevoMensaje("");
  };

  return (
    <div className={styles.chatContainer}>
      {/* Lista de contactos (izquierda) */}
      <aside className={styles.contactList}>
        <Contact 
          name="Agus" 
          profilePic="https://plus.unsplash.com/premium_photo-1689568158814-3b8e9c1a9618?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8JTIzcGVyc29uYXxlbnwwfHwwfHx8MA%3D%3D" 
          online={true} 
          status="Disponible" 
        />
        <Contact 
          name="Chiara" 
          profilePic="/chiara.jpg" 
          online={false} 
          status="Desconectada" 
        />
      </aside>

      {/* Chat principal (derecha) */}
      <main className={styles.chatWindow}>
        <div className={styles.mensajes}>
          {mensajes.map((m, i) => (
            <Mensaje key={i} {...m} />
          ))}
        </div>

        <div className={styles.inputBox}>
          <Input 
            type="text" 
            value={nuevoMensaje} 
            onChange={(e) => setNuevoMensaje(e.target.value)} 
          />
          <Button texto="Enviar" funcionalidad={enviarMensaje} />
        </div>
      </main>
    </div>
  );
}
