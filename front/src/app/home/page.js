"use client"
import Contact from "@/components/Contact"
import Input from "@/components/Input"
import Button from "@/components/Button"
import Mensaje from "@/components/Mensaje"
import styles from "./page.module.css"
import { useEffect, useState } from "react"

export default function Home() {
    const [idLogged, setIdLogged] = useState(-1);
    const [mandar, setMandar] = useState(0);
    const [src, setSrc] = useState(0);
    const [contact, setContact] = useState(0);
    const [contacts, setContacts] = useState([]);
    const [mensajes, setMensajes] = useState([]);
    const [chatActivo, setChatActivo] = useState(null);

    useEffect(() => {
        setIdLogged(localStorage.getItem("idLogged"))
    }, [])

    useEffect(()=>{
        if (idLogged != -1) {
            traerChats()
        
        }
    }, [idLogged])

    useEffect(()=>{

        // ejecuta cuando se modifica contacts
        console.log("contacts modificado", contacts)


    },[contacts])


    function enviar() {}

    function buscar() {}
    //chequear
    function abrirChat(id_chat) {
        setChatActivo(id_chat);
        fetch(`http://localhost:4001/MensajesChat?id_chat=${id_chat}`)
            .then(res => res.json())
            .then(data => {
                setMensajes(data.mensajes || []);
            });
    }

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
            if (response && response.contactos) {
                console.log(response)
                const contactosPlanos = response.contactos.flat();
                // Filtrar duplicados de grupos por nombre_grupo
                const contactosUnicos = [];
                const gruposVistos = new Set();
                contactosPlanos.forEach(contacto => {
                    if (contacto.es_grupo === 1) {
                        if (!gruposVistos.has(contacto.nombre_grupo)) {
                            gruposVistos.add(contacto.nombre_grupo);
                            contactosUnicos.push(contacto);
                        }
                    } else {
                        contactosUnicos.push(contacto);
                    }
                });
                const contactosSinYo = contactosUnicos.filter(
                    contacto => contacto.es_grupo === 1 || contacto.id_usuario !== Number(idLogged)
                );
                setContacts(contactosSinYo);
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
                    {contacts.length > 0 ? (
                        contacts.map((contact, index) => {
                            const nombreMostrar = contact.es_grupo === 1 ? contact.nombre_grupo : contact.nombre;
                            return (
                                <div key={index} onClick={() => abrirChat(contact.id_chat)}>
                                    <Contact
                                        src={contact.foto_perfil}
                                        name={nombreMostrar}
                                        online={contact.online}
                                        status={contact.estado}
                                    />
                                </div>
                            );
                        })
                    ) : (
                        <p>No hay contactos</p>
                    )}
                </div>
                <Button onClick={traerChats} text={"traer contactos"} />
            </div>
            <div className={styles.main}>
                <div id="mensajes">
                    <h3>Mensajes del chat</h3>
                    {chatActivo ? (
                        mensajes.length > 0 ? (
                            <ul>
                                {mensajes.map((msg, i) => (
                                    <li key={i}>
                                        <strong>{msg.nombre}:</strong> {msg.contenido}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No hay mensajes en este chat.</p>
                        )
                    ) : (
                        <p>Selecciona un chat para ver los mensajes.</p>
                    )}
                </div>
                <div id="chat">
                    <Input placeholder={"Escribe tu mensaje..."} />
                    <Button onClick={enviar} text={mandar} />
                </div>
            </div>
        </div>
    )
}