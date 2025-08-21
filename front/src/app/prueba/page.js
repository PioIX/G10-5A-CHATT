"use client"

import Contact from "@/components/Contact"
import Mensaje from "@/components/Mensaje"

export default function TestPage() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Vista de prueba</h1>

      <h2>Contactos</h2>
      <Contacto 
        name="Sofía" 
        profilePic="https://via.placeholder.com/60" 
        status="Disponible 📱" 
      />
      <Contacto 
        name="Agustín" 
        profilePic="https://via.placeholder.com/60" 
        status="En el gym 💪" 
      />

      <h2>Mensajes</h2>
      <div style={{ backgroundColor: "#eee", padding: "10px", borderRadius: "10px" }}>
        <Mensaje texto="Hola Sofi!" hora="12:30" tipo="recibido" />
        <Mensaje texto="Todo bien, vos?" hora="12:31" tipo="enviado" />
        <Mensaje texto="Armando el TP 😅" hora="12:32" tipo="recibido" />
      </div>
    </div>
  )
}