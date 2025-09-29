"use client"
import { io } from "socket.io-client";
import Contact from "@/components/Contact"
import Input from "@/components/Input"
import Button from "@/components/Button"
import Mensaje from "@/components/Mensaje"
import styles from "./page.module.css"
import { useEffect, useState } from "react"

export default function Home() {
    const [idLogged, setIdLogged] = useState(-1);
    const [nombreUsuario, setNombreUsuario] = useState("");
    const [mandar, setMandar] = useState(0);
    const [src, setSrc] = useState(0);
    const [contact, setContact] = useState(0);
    const [contacts, setContacts] = useState([]);
    const [mensajes, setMensajes] = useState([]);
    const [chatActivo, setChatActivo] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [allContacts, setAllContacts] = useState([]);

    useEffect(() => {
        const id = localStorage.getItem("idLogged");
        setIdLogged(id);
        // Traer nombre del usuario logueado
        fetch(`http://localhost:4001/Usuarios?num_telefono=${localStorage.getItem("num_telefono")}`)
            .then(res => res.json())
            .then(data => {
                if (data.usuarios && data.usuarios.length > 0) {
                    setNombreUsuario(data.usuarios[0].nombre);
                }
            });
        // Traer todos los contactos para el desplegable
        fetch('http://localhost:4001/Usuarios')
            .then(res => res.json())
            .then(data => {
                if (data.usuarios) {
                    setAllContacts(data.usuarios.filter(u => u.id_usuario !== Number(id)));
                }
            });
    }, []);

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


    function nuevoChat() {
        setShowDropdown(!showDropdown);
    }

    function iniciarChatConContacto(contacto) {
        // Aquí podrías crear el chat en el backend si no existe, o buscarlo
        alert(`Iniciar chat con ${contacto.nombre}`);
        setShowDropdown(false);
    }


    //HACER!!!!!!!!!!!!!!!!!!!!!!!!!
    function abrirChat(id_chat) {
        console.log("Abriendo chat con id:", id_chat);
        fetch(`http://localhost:4001/MensajesChat?id_chat=${id_chat}&id_usuario=${idLogged}`)
            .then(res => res.json())
            .then(data => {
                // Filtrar solo los mensajes donde el usuario logueado participa
                if (data.mensajes) {
                    console.log(data.mensajes)
                    setMensajes(data.mensajes.filter(m => m.num_telefono == localStorage.getItem("num_telefono") || m.id_chat == id_chat));
                } else {
                    setMensajes([]);
                }
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
                <div id="usuario-logueado" style={{textAlign: 'right', marginBottom: 10}}>
                    <strong>Usuario:</strong> {nombreUsuario}
                </div>
                <div id="nuevo-chat">
                    <Button onClick={nuevoChat} text={"Nuevo chat"} />
                    {showDropdown && (
                        <div style={{background: '#fff', border: '1px solid #ccc', maxHeight: 200, overflowY: 'auto', position: 'absolute', zIndex: 10}}>
                            <ul style={{listStyle: 'none', margin: 0, padding: 0}}>
                                {allContacts.map((c, i) => (
                                    <li key={i} style={{padding: 8, cursor: 'pointer'}} onClick={() => iniciarChatConContacto(c)}>
                                        {c.nombre}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
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
            </div>
        </div>
    )
}