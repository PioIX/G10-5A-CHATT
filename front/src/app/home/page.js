"use client"
import Contact from "@/components/Contact"
import Input from "@/components/Input"
import Button from "@/components/Button"
import Mensaje from "@/components/Mensaje"
import styles from "./page.module.css"
import { useEffect, useState } from "react"

export default function Home() {
    const [idLogged, setIdLogged] = useState(0);
    const [mandar, setMandar] = useState(0);
    const [src, setSrc] = useState(0);
    const [contact, setContact] = useState(0);

    useEffect(() => {
        setIdLogged(localStorage.getItem("idLogged"))
    }, [])

    function enviar() {}

    function buscar() {}

    async function traerChats() {
        fetch('http://localhost:4001/Chats', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ idLogged: idLogged })
        })
            .then(response => response.json())
            .then(response => {
                if (response) {
                    console.log(response)
                    return (response)
                } else {
                    alert("Número de teléfono o contraseña incorrectos");
                }
            })
    }

    return (
        <div className={styles.container}>
            <div className={styles.sidebar}>
                <div id="buscador">
                    <h2>Buscar contacto</h2>
                    <Input placeholder={"Buscar contacto..."} />
                    <Button onClick={buscar} />
                </div>
                <div className={styles["contacts-list"]}>
                    <Contact src={src} contact={contact} />
                </div>
                <Button onClick={traerChats} text={"traer contactos"} />
            </div>
            <div className={styles.main}>
                <div id="mensajes">
                    <Mensaje />
                </div>
                <div id="chat">
                    <Input placeholder={"Escribe tu mensaje..."} />
                    <Button onClick={enviar} text={mandar} />
                </div>
            </div>
        </div>
    )
}