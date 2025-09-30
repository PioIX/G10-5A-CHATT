"use client"
import { io } from "socket.io-client";
import Contact from "@/components/Contact"
import Input from "@/components/Input"
import Button from "@/components/Button"
import Mensaje from "@/components/Mensaje"
import styles from "./page.module.css"
import { use, useEffect, useState } from "react"

export default function Home() {
    const [idLogged, setIdLogged] = useState(-1);
    const [nombreUsuario, setNombreUsuario] = useState("");
    const [mandar, setMandar] = useState(0);
    const [src, setSrc] = useState(0);
    const [contact, setContact] = useState(0);
    const [contacts, setContacts] = useState([]);
    const [mensajes, setMensajes] = useState([]);
    const [mensajeNuevo, setMensajeNuevo] = useState([]);
    const [chatActivo, setChatActivo] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [allContacts, setAllContacts] = useState([]);
    const [chatSeleccionadoId, setChatSeleccionadoId] = useState(null);
    const [socket, setSocket] = useState(null);
    const [modal, setModal] = useState({ open: false, title: "", message: "" });
    //const [idUsuarioActual, setIdUsuarioActual] = useState(-1); // ID del usuario actual

    useEffect(() => {
        const id = localStorage.getItem("idLogged");
        setIdLogged(id);
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
    
    
    async function fecha() {
        const ahora = new Date();
        // formatear la fecha: dd/mm/yyyy hh:mm:ss
        const fechaFormateada = ahora.toLocaleString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        });
        return fechaFormateada;
  }

    useEffect(() => {
        const newSocket = io("http://localhost:4001");
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };

    }, []);
 
    useEffect(() => {
      if (!socket) return;
   
      socket.on("newMessage", (data) => {
        console.log("Mensaje", data);
   
        setMensajes((todosMensajes) => [
          ...todosMensajes,
          {
            contenido: data.message.contenido,
            nombre: data.message.nombre,
            src: data.message.src,
            fecha:fecha(),
            lado: data.message.idUsuario === idLogged ? "derecha" : "izquierda",
          },
        ]);
      });
   
     return () => { socket.off("newMessage"); };
    }, [socket, idLogged]);

   

  const showModal = (title, message) => {
    setModal({ open: true, title, message });
  };

  const closeModal = () => {
    setModal({ ...modal, open: false });
  };

    async function enviarMensaje() {
        if (!mensajeNuevo.trim() || !chatActivo || idLogged === -1) return;

        const body = {
            id_usuario: idLogged,
            mensaje: mensajeNuevo,
            id_chat: chatActivo,

        };

        try {
            const res = await fetch("http://localhost:4001/insertarMensaje", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
            });
            const data = await res.json();
            if (data.validar) {
                setMensajeNuevo(""); // Limpia el input
                abrirChat(chatActivo); // Refresca los mensajes del chat
            } else {
            alert("No se pudo enviar el mensaje");
            }
        } catch (error) {
            alert("Error al enviar el mensaje");
        }
}


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
        setChatActivo(id_chat);
        setChatSeleccionadoId(id_chat); // Esto disparará el useEffect para traer los mensajes
        fetch(`http://localhost:4001/MensajesChat?id_chat=${id_chat}&id_usuario=${idLogged}`)
            .then(res => res.json())
            .then(data => {
                // Filtrar solo los mensajes donde el usuario logueado participa
                if (data.mensajes) {
                    const mensajesNoDuplicados = Array.from(new Map(data.mensajes.map(m => [m.id_mensaje, m])).values());
                    console.log(data.mensajes)
                    setMensajes(mensajesNoDuplicados);
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




    async function traerMensajes (){
        
    }

    return (
        <div className={styles.container}>
            {/* Modal de usuarios disponibles */}
            {showDropdown && (
                <div className={styles.modalOverlay} onClick={() => setShowDropdown(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()} style={{maxWidth: 400}}>
                        <div className={styles.dropdownHeader}>
                            <strong>Usuarios disponibles</strong>
                            <button className={styles.closeBtn} onClick={() => setShowDropdown(false)}>✕</button>
                        </div>
                        {allContacts.length > 0 ? (
                            <ul className={styles.dropdownList}>
                                {allContacts.map((usuario, i) => (
                                    <li key={i} className={styles.dropdownItem}
                                        onClick={() => iniciarChatConContacto(usuario)}>
                                        <div className={styles.usuarioInfo}>
                                            <img src={usuario.foto_perfil || '/default-avatar.png'} alt={usuario.nombre} className={styles.usuarioAvatar} />
                                            <div>
                                                <div className={styles.usuarioNombre}>{usuario.nombre}</div>
                                                <div className={styles.usuarioTelefono}>{usuario.num_telefono}</div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className={styles.noUsuarios}>No hay usuarios disponibles</p>
                        )}
                    </div>
                </div>
            )}

            {/* Modal de mensajes generales */}
            {modal.open && (
                <div className={styles.modalOverlay} onClick={closeModal}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <h2>{modal.title}</h2>
                        <p>{modal.message}</p>
                        <Button onClick={closeModal} text="Cerrar" />
                    </div>
                </div>
            )}

            <div className={styles.sidebar}>
                {/* Botón Nuevo chat arriba a la izquierda, bien visible */}
                <div id="nuevo-chat" style={{ position: 'sticky', top: 0, zIndex: 10, background: '#005c4b', padding: '18px 20px 8px 20px', borderBottom: '2px solid #1a2329' }}>
                    <Button 
                      funcionalidad={nuevoChat} 
                      texto={<span style={{color:'#fff',fontWeight:'bold',fontSize:'18px',letterSpacing:'0.5px'}}><span style={{fontWeight:'bold',fontSize:'22px',marginRight:8}}>➕</span>Nuevo chat</span>} 
                      className={styles.botonNuevoChat}
                    />
                </div>
                <div id="usuario-logueado" style={{ textAlign: 'right', marginBottom: 10, color: '#fff' }}>
                    <strong>Usuario:</strong> {nombreUsuario}
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
                <Button onClick={traerChats} text={"Actualizar contactos"} />
            </div>

            <div className={styles.main}>
                <div id="mensajes">
                    {chatActivo ? (
                        mensajes.length > 0 ? (
                            <ul className={styles.mensajesLista}>
                                {mensajes.map((msg, i) => (
                                    <li key={i}
                                        className={msg.id_usuario === Number(idLogged) ? styles.mensajeDerecha : styles.mensajeIzquierda}>
                                        <strong>{msg.nombre}:</strong> {msg.mensaje}
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
                <div className={styles.chatInput}>
                    <Input
                        placeholder="Escribe tu mensaje..."
                        value={mensajeNuevo}
                        onChange={e => setMensajeNuevo(e.target.value)}
                        className={styles.inputMensaje}
                    />
                    <Button
                        funcionalidad={enviarMensaje}
                        texto="Enviar"
                        className={styles.botonEnviar}
                    />
                </div>
            </div>
        </div>
    )
}