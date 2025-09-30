"use client"
import { io } from "socket.io-client";
import Contact from "@/components/Contact"
import Input from "@/components/Input"
import Button from "@/components/Button"
import styles from "./page.module.css"
import { useEffect, useState, useRef } from "react"

export default function Home() {
    const [idLogged, setIdLogged] = useState(-1);
    const [nombreUsuario, setNombreUsuario] = useState("");
    const [contacts, setContacts] = useState([]);
    const [mensajes, setMensajes] = useState([]);
    const [mensajeNuevo, setMensajeNuevo] = useState("");
    const [chatActivo, setChatActivo] = useState(null);
    const [chatActivoNombre, setChatActivoNombre] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [allContacts, setAllContacts] = useState([]);
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const mensajesEndRef = useRef(null);

    // Auto-scroll a nuevos mensajes
    useEffect(() => {
        mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

        console.log("ACTUALICÉ MENSAJES: ",mensajes)
    }, [mensajes]);

    useEffect(() => {
        const id = localStorage.getItem("idLogged");
        const telefono = localStorage.getItem("num_telefono");
        setIdLogged(id);
        
        fetch(`http://localhost:4001/Usuarios?num_telefono=${telefono}`)
            .then(res => res.json())
            .then(data => {
                if (data.usuarios && data.usuarios.length > 0) {
                    setNombreUsuario(data.usuarios[0].nombre);
                }
            });
            
        fetch('http://localhost:4001/Usuarios')
            .then(res => res.json())
            .then(data => {
                if (data.usuarios) {
                    setAllContacts(data.usuarios.filter(u => u.id_usuario !== Number(id)));
                }
            });
    }, []);

    useEffect(() => {
        if (idLogged != -1) {
            traerChats();
        }
    }, [idLogged]);
    
    const formatearFecha = () => {
        const ahora = new Date();
        return ahora.toLocaleTimeString("es-AR", {
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    useEffect(() => {

        if (!socket) return;

        const newSocket = io("http://localhost:4001");
        setSocket(newSocket);

        newSocket.on('connect', () => {
            setIsConnected(true);
            console.log('Socket conectado');
        });

        newSocket.on('disconnect', () => {
            setIsConnected(false);
            console.log('Socket desconectado');
        });
        socket.on("newMessage", (data) => {
            console.log("Mensaje recibido:", data);

            if (parseInt(data.room) === parseInt(chatActivo)) {
                const mensajeNuevo = {
                        contenido: data.mensaje,
                        nombre: data.nombre,
                        fecha: formatearFecha(),
                        lado: data.id_usuario === Number(idLogged) ? "derecha" : "izquierda",
                        id_mensaje: Date.now()
                    }; 
                setMensajes(prev => [...prev, mensajeNuevo]);

                }
            console.log("Mensajes:", mensajes);

        });	

        return () => {
            newSocket.disconnect();
        };
    }, [socket]);
 
    

    async function enviarMensaje() {
        if (!mensajeNuevo.trim() || !chatActivo || idLogged === -1) return;
        if (socket) {
            console.log("Enviando mensaje:", mensajeNuevo);
            socket.emit("sendMessage", {
                room: chatActivo,
                mensaje: mensajeNuevo,
                });
        }
        const body = {
            id_usuario: idLogged,
            mensaje: mensajeNuevo,
            id_chat: chatActivo,
        };

        // Agregar mensaje local inmediatamente
        const mensajeLocal = {
            contenido: mensajeNuevo,
            nombre: nombreUsuario,
            fecha: formatearFecha(),
            lado: "derecha",
            id_mensaje: Date.now()
        };
        
        setMensajes(prev => [...prev, mensajeLocal]);
        setMensajeNuevo("");

        try {
            const res = await fetch("http://localhost:4001/insertarMensaje", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (data.validar) {
                traerChats();
            } else {
                alert("No se pudo enviar el mensaje");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Error al enviar el mensaje");
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            enviarMensaje();
        }
    };

    function nuevoChat() {
        setShowDropdown(!showDropdown);
    }

    async function iniciarChatConContacto(contacto) {
        try {
            // Verificar si ya existe un chat con este contacto
            const chatExistente = contacts.find(c => 
                c.id_usuario === contacto.id_usuario && c.es_grupo === 0
            );

            if (chatExistente) {
                setShowDropdown(false);
                abrirChat(chatExistente.id_chat, contacto.nombre);
                return;
            }

            // Intentar crear el chat
            const resCrear = await fetch("http://localhost:4001/CrearChat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id_usuario1: idLogged,
                    id_usuario2: contacto.id_usuario
                })
            });
            
            const dataCrear = await resCrear.json();
            
            if (dataCrear.id_chat) {
                setShowDropdown(false);
                
                // Primero abrir el chat con mensajes vacíos
                setChatActivo(dataCrear.id_chat);
                setChatActivoNombre(contacto.nombre);
                setMensajes([]);
                
                // Luego actualizar la lista de contactos
                await traerChats();
            } else {
                alert("No se pudo crear el chat");
            }
        } catch (error) {
            console.error("Error al iniciar chat:", error);
            alert("Hubo un problema al crear el chat");
        }
    }

    function abrirChat(id_chat, nombre) {
        console.log("Abriendo chat con id:", id_chat);
        setChatActivo(id_chat);
        if (socket) {
            socket.emit("joinRoom", { room: chatActivo });
        }
        setChatActivoNombre(nombre);
        fetch(`http://localhost:4001/MensajesChat?id_chat=${id_chat}&id_usuario=${idLogged}`)
            .then(res => res.json())
            .then(data => {
                if (data.mensajes) {
                    const mensajesFormateados = data.mensajes.map(m => ({
                        id_mensaje: m.id_mensaje,
                        contenido: m.mensaje,
                        nombre: m.nombre,
                        fecha: new Date(m.hora_de_envio).toLocaleTimeString('es-AR', {
                            hour: '2-digit',
                            minute: '2-digit'
                        }),
                        lado: m.id_usuario === Number(idLogged) ? "derecha" : "izquierda",
                        id_usuario: m.id_usuario
                    }));
                    setMensajes(mensajesFormateados);
                } else {
                    setMensajes([]);
                }
            })
            .catch(error => {
                console.error("Error al cargar mensajes:", error);
                setMensajes([]);
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
                console.log(response);
                const contactosPlanos = response.contactos.flat();
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
            }
        })
        .catch(error => {
            console.error("Error al traer chats:", error);
        });
    }

    const esGrupo = contacts.find(c => c.id_chat === chatActivo)?.es_grupo === 1;

    // Filtrar contactos que ya están en chats
    const contactosDisponibles = allContacts.filter(
        contacto => !contacts.some(c => c.id_usuario === contacto.id_usuario && c.es_grupo === 0)
    );

    return (
        <div className={styles.container}>
            {/* Modal Nuevo Chat */}
            {showDropdown && (
                <div className={styles.modalOverlay} onClick={() => setShowDropdown(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Nuevo chat</h3>
                            <button 
                                className={styles.closeBtn} 
                                onClick={() => setShowDropdown(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            {contactosDisponibles.length > 0 ? (
                                <ul className={styles.contactsList}>
                                    {contactosDisponibles.map((usuario, i) => (
                                        <li 
                                            key={i} 
                                            className={styles.contactItem}
                                            onClick={() => iniciarChatConContacto(usuario)}
                                        >
                                            {usuario.foto_perfil ? (
                                                <img 
                                                    src={usuario.foto_perfil} 
                                                    alt={usuario.nombre}
                                                    className={styles.contactAvatar}
                                                />
                                            ) : (
                                                <div className={styles.contactAvatar}>
                                                    {usuario.nombre[0].toUpperCase()}
                                                </div>
                                            )}
                                            <div className={styles.contactInfo}>
                                                <div className={styles.contactNombre}>
                                                    {usuario.nombre}
                                                </div>
                                                <div className={styles.contactTelefono}>
                                                    {usuario.num_telefono}
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className={styles.noContactos}>No hay usuarios disponibles</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Sidebar */}
            <div className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.userInfo}>
                        <h2>Chats</h2>
                        <div className={styles.userStatus}>
                            {isConnected && <span className={styles.statusDot}></span>}
                            <span className={styles.userName}>{nombreUsuario}</span>
                        </div>
                    </div>
                    <Button 
                        funcionalidad={nuevoChat} 
                        texto="➕ Nuevo chat"
                        className={styles.btnNuevoChat}
                    />
                </div>

                <div className={styles.contactsList}>
                    {contacts.length > 0 ? (
                        contacts.map((contact, index) => {
                            const nombreMostrar = contact.es_grupo === 1 
                                ? contact.nombre_grupo 
                                : contact.nombre;
                            const fotoMostrar = contact.es_grupo === 1 
                                ? '/group-default.png' 
                                : (contact.foto_perfil || '/default-avatar.png');
                            
                            return (
                                <div 
                                    key={index} 
                                    onClick={() => abrirChat(contact.id_chat, nombreMostrar)}
                                    className={`${styles.contactItem} ${chatActivo === contact.id_chat ? styles.activeChat : ''}`}
                                >
                                    <Contact
                                        src={fotoMostrar}
                                        name={nombreMostrar}
                                        online={contact.online}
                                        status={contact.estado}
                                    />
                                </div>
                            );
                        })
                    ) : (
                        <p className={styles.noContactos}>No hay contactos</p>
                    )}
                </div>

                <div className={styles.sidebarFooter}>
                    <Button 
                        funcionalidad={traerChats} 
                        texto="🔄 Actualizar"
                        className={styles.btnActualizar}
                    />
                </div>
            </div>

            {/* Área de chat */}
            <div className={styles.main}>
                {chatActivo ? (
                    <>
                        {/* Header del chat */}
                        <div className={styles.chatHeader}>
                            <div className={styles.chatHeaderAvatar}>
                                {chatActivoNombre[0]?.toUpperCase()}
                            </div>
                            <div className={styles.chatHeaderInfo}>
                                <h3>{chatActivoNombre}</h3>
                                <span>
                                    {contacts.find(c => c.id_chat === chatActivo)?.online 
                                        ? 'En línea' 
                                        : 'Desconectado'}
                                </span>
                            </div>
                        </div>

                        {/* Mensajes */}
                        <div className={styles.mensajesArea}>
                            {mensajes.length > 0 ? (
                                <ul className={styles.mensajesLista}>
                                    {mensajes.map((msg, i) => (
                                        <li 
                                            key={i}
                                            className={msg.lado === "derecha" 
                                                ? styles.mensajeDerecha 
                                                : styles.mensajeIzquierda}
                                        >
                                            {esGrupo && msg.lado === "izquierda" && (
                                                <strong className={styles.nombreMensaje}>
                                                    {msg.nombre}:
                                                </strong>
                                            )}
                                            <div className={styles.contenidoMensaje}>
                                                {msg.contenido}
                                            </div>
                                            <div className={styles.horaMensaje}>
                                                {msg.fecha}
                                            </div>
                                        </li>
                                    ))}
                                    <div ref={mensajesEndRef} />
                                </ul>
                            ) : (
                                <p className={styles.noMensajes}>No hay mensajes. ¡Envía el primero!</p>
                            )}
                        </div>

                        {/* Input de mensaje */}
                        <div className={styles.chatInput}>
                            <Input
                                placeholder="Escribe un mensaje..."
                                value={mensajeNuevo}
                                onChange={(e) => setMensajeNuevo(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className={styles.inputMensaje}
                            />
                            <Button
                                funcionalidad={enviarMensaje}
                                texto="Enviar"
                                className={styles.botonEnviar}
                            />
                        </div>
                    </>
                ) : (
                    <div className={styles.noChat}>
                        <div className={styles.noChatIcon}>💬</div>
                        <h2>WhatsApp Clone</h2>
                        <p>Selecciona un chat para comenzar a conversar</p>
                    </div>
                )}
            </div>
        </div>
    );
}