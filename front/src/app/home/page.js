/*
====================================================================
=                     EXAMEN COMPLETO DAI – SUPER COMENTARIO       =
====================================================================

Este comentario contiene **TODOS LOS ARCHIVOS** del examen:
✔ /registro/page.jsx
✔ Subasta.js
✔ OfertaDeSubasta.js
✔ /subastas/page.jsx
✔ useSocket.js

Todo explicado de forma clara, simple y entendible.

====================================================================
=                        1) /registro/page.jsx                      =
====================================================================

Página donde el usuario ingresa username y alumnoId.
Usa:
- useState → guardar inputs
- validate → mínimo 3 caracteres
- router.push → navegar a /subastas
- query string → enviar datos por URL (?username=XXX&alumnoId=YYY)

--------------------------------------------------------------------
CÓDIGO:
--------------------------------------------------------------------

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegistroPage() {

  // Estados de inputs:
  const [username, setUsername] = useState("");
  const [alumnoId, setAlumnoId] = useState("");

  const router = useRouter();

  function irASubastas() {
    if (username.length < 3) {
      alert("El nombre debe tener al menos 3 caracteres");
      return;
    }

    // Navegamos usando parámetros de URL
    router.push(`/subastas?username=${username}&alumnoId=${alumnoId}`);
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Registro</h1>

      <input
        placeholder="Tu nombre"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      {username.length > 0 && username.length < 3 && (
        <p style={{ color: "red" }}>El nombre debe tener mínimo 3 letras</p>
      )}

      <br /><br />

      <input
        placeholder="ID alumno"
        type="number"
        value={alumnoId}
        onChange={(e) => setAlumnoId(e.target.value)}
      />

      <br /><br />

      <button onClick={irASubastas}>Ir a Subastas</button>
    </div>
  );
}


====================================================================
=                        2) Subasta.js                              =
====================================================================

Componente que muestra los datos de la subasta:
- producto
- precioActual
- mejorPostor (opcional)

Usa conditional rendering.

--------------------------------------------------------------------
CÓDIGO:
--------------------------------------------------------------------

export default function Subasta({ producto, precioActual, mejorPostor }) {
  return (
    <div style={{ border: "1px solid black", padding: 20 }}>
      <h2>Producto: {producto}</h2>
      <p>Precio actual: ${precioActual}</p>

      {mejorPostor ? (
        <p>Mejor postor: {mejorPostor}</p>
      ) : (
        <p>No existe un mejor postor.</p>
      )}
    </div>
  );
}


====================================================================
=                        3) OfertaDeSubasta.js                      =
====================================================================

Componente que permite ingresar una nueva oferta:
- input
- botón Ofertar
Usa funciones que vienen por props.

--------------------------------------------------------------------
CÓDIGO:
--------------------------------------------------------------------

export default function OfertaDeSubasta({
  onChangeOferta,
  onClickRealizarOferta
}) {

  return (
    <div style={{ marginTop: 20 }}>
      <h3>Realizar nueva oferta</h3>

      <input
        type="number"
        placeholder="Monto"
        onChange={(e) => onChangeOferta(e.target.value)}
      />

      <button onClick={onClickRealizarOferta}>
        Ofertar
      </button>
    </div>
  );
}


====================================================================
=                        4) /subastas/page.jsx                      =
====================================================================

Página con toda la lógica del examen:
✔ Obtiene username + alumnoId de searchParams
✔ Conecta socket.io con useSocket()
✔ Botón para unirse a la sala:
        socket.emit("join_subasta", { alumnoId })
✔ Escucha eventos:
        joined_OK_subasta
        nueva_oferta
        subasta_finalizada
✔ Muestra el componente Subasta
✔ Muestra componente OfertaDeSubasta
✔ Maneja historial de ofertas

--------------------------------------------------------------------
CÓDIGO:
--------------------------------------------------------------------

"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import useSocket from "../hooks/useSocket";

import Subasta from "../components/Subasta";
import OfertaDeSubasta from "../components/OfertaDeSubasta";

export default function SubastasPage() {

  // 1) Obtener parámetros desde la URL
  const params = useSearchParams();
  const username = params.get("username");
  const alumnoId = params.get("alumnoId");

  // 2) Conectar al socket
  const socket = useSocket("http://10.1.5.137:4000");

  // 3) ESTADOS:
  const [subasta, setSubasta] = useState(null);
  const [montoOferta, setMontoOferta] = useState("");
  const [historial, setHistorial] = useState([]);
  const [conectado, setConectado] = useState(false);

  // 4) Unirse a la sala
  function unirseSala() {
    if (!socket) return;

    socket.emit("join_subasta", { alumnoId });

    setConectado(true);
  }

  // 5) Lógica de listeners
  useEffect(() => {
    if (!socket) return;

    socket.on("joined_OK_subasta", (data) => {
      setSubasta(data);
    });

    socket.on("nueva_oferta", (data) => {
      setSubasta(data);

      setHistorial((h) => {
        const nuevo = [data, ...h];
        return nuevo.slice(0, 5);
      });
    });

    socket.on("subasta_finalizada", (data) => {
      alert("¡La subasta ha finalizado!");
      setSubasta(data);
      setHistoral([]);
      setMontoOferta("");
    });

  }, [socket]);

  // 6) Emitir oferta
  function realizarOferta() {
    if (!socket) return;

    if (Number(montoOferta) <= subasta.precioActual) {
      alert("La oferta debe ser mayor al precio actual");
      return;
    }

    socket.emit("realizar_oferta", {
      usuario: username,
      monto: Number(montoOferta),
    });

    setMontoOferta("");
  }

  // 7) RENDER
  return (
    <div style={{ padding: 20 }}>

      <h1>Subastas</h1>

      {conectado && <h3>Número de sala: {alumnoId}</h3>}

      {!conectado && (
        <button onClick={unirseSala}>Unirse a la sala de subasta</button>
      )}

      {subasta && (
        <>
          <Subasta
            producto={subasta.producto}
            precioActual={subasta.precioActual}
            mejorPostor={subasta.mejorPostor}
          />

          <OfertaDeSubasta
            onChangeOferta={setMontoOferta}
            onClickRealizarOferta={realizarOferta}
          />

          <h3>Historial de ofertas</h3>
          {historial.length === 0 ? (
            <p>No hay ofertas.</p>
          ) : (
            historial.map((item, i) => (
              <p key={i}>
                {item.mejorPostor} ofertó ${item.precioActual}
              </p>
            ))
          )}
        </>
      )}

    </div>
  );
}



====================================================================
=                        5) useSocket.js                            =
====================================================================

Hook que crea la conexión con el servidor de socket.
Devuelve el socket para usar en cualquier página.

--------------------------------------------------------------------
CÓDIGO:
--------------------------------------------------------------------

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function useSocket(url) {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const s = io(url, { transports: ["websocket"] });
    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [url]);

  return socket;
}


====================================================================
=                           FIN DEL MEGA COMENTARIO                =
====================================================================

*/


"use client"
import { io } from "socket.io-client";
import Contact from "@/components/Contact"
import Input from "@/components/Input"
import Button from "@/components/Button"
import styles from "./page.module.css"
import { useEffect, useState, useRef } from "react"
import { useSocket } from "@/hook/useSocket";

export default function Home() {
    const [idLogged, setIdLogged] = useState(-1);
    const [nombreUsuario, setNombreUsuario] = useState("");
    const [contacts, setContacts] = useState([]);
    const [mensajes, setMensajes] = useState([]);
    const [mensajeNuevo, setMensajeNuevo] = useState("");
    const [mensajeNuevoRecibido, setMensajeNuevoRecibido] = useState("");
    const [chatActivo, setChatActivo] = useState(null);
    const [chatActivoNombre, setChatActivoNombre] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [allContacts, setAllContacts] = useState([]);
    const {socket,isConnected} = useSocket()
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

        socket.on('connect', () => {
            
            console.log('Socket conectado');
        });

        socket.on('disconnect', () => {
            
            console.log('Socket desconectado');
        });
        socket.on("newMessage", (data) => {
            console.log("Mensaje recibido:", data, " Chat activo: ", chatActivo);

            const mensajeRecibido = {
                    contenido: data.message.mensaje.contenido,
                    nombre: data.message.mensaje.nombre,
                    fecha: formatearFecha(),
                    lado: data.message.mensaje.id_usuario == Number(idLogged) ? "derecha" : "izquierda",
                    id_mensaje: Date.now()
                }; 
            setMensajes(prev => [...prev, mensajeRecibido]);
                console.log("Mensaje recibido: " , mensajeRecibido)
        
            console.log("Mensajes:", mensajes);

        });	

    }, [socket]);
 
    

    async function enviarMensaje() {
        if (!mensajeNuevo.trim() || !chatActivo || idLogged === -1) return;
       
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
            id_mensaje: Date.now(),
            id_usuario: idLogged,
        };
        
         if (socket) {
            console.log("Enviando mensaje:", mensajeLocal);
            socket.emit("sendMessage", {
                room: chatActivo,
                mensaje: mensajeLocal,
                });
        }
        // No hace falta agregarlo al mandarlo, porque lo voy a recibir
       // setMensajes(prev => [...prev, mensajeLocal]);
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
            console.log("idLogged", idLogged)
            console.log("contacto", contacto.id_usuario)
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
            console.log(dataCrear)
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
                        <h2>WhatsApp 134</h2>
                        <p>Selecciona un chat para comenzar a conversar</p>
                    </div>
                )}
            </div>
        </div>
    );
}

/*
======================================================================
🌟🌟🌟 RESUMEN DEFINITIVO PARA LA PRUEBA DE REACT + BACKEND 🌟🌟🌟
======================================================================

Este comentario gigante contiene TODO lo que necesitás saber para el 
recuperatorio: componentes, props, estados, mapas, renderizado 
condicional, fetch, GET, POST, spread operator, useEffect, inputs, 
conexión front-back, endpoints… TODO.

======================================================================
🔵 1. COMPONENTES EN REACT
======================================================================

✔ Un componente es una función que devuelve HTML (JSX).
✔ Sirven para NO repetir código y separar todo en partes.

Ejemplo componente básico:
function Title({ text }) {
  return <h1>{text}</h1>;
}

✔ Componente compuesto = usa varios componentes adentro

function Producto({ nombre, descripcion, onEliminar }) {
  return (
    <div>
      <Title text={nombre} />
      <p>{descripcion}</p>
      <button onClick={onEliminar}>Eliminar</button>
    </div>
  );
}

======================================================================
🔵 2. PROPS
======================================================================

Props = datos que un componente padre le pasa a un hijo.

<Producto nombre="Coca" descripcion="Bebida" />

El hijo lo recibe así:
function Producto({ nombre, descripcion }) { ... }

Los props NO se pueden cambiar desde adentro del hijo.

======================================================================
🔵 3. ESTADO (useState)
======================================================================

const [valor, setValor] = useState(valorInicial)

✔ useState permite que React actualice la pantalla al cambiar un valor.
✔ Si usás let/const normales, la pantalla NO se actualiza.

Ej:
const [contador, setContador] = useState(0);
setContador(contador + 1);

NUNCA:
contador++  // No repinta la UI

======================================================================
🔵 4. MAP (para mostrar listas)
======================================================================

Se usa para recorrer arrays y renderizar elementos:

productos.map((prod) => (
  <Producto nombre={prod.nombre} descripcion={prod.descripcion} />
))

✔ SIEMPRE va dentro del return
✔ El array del map debe ser el del useState
✔ El parámetro del map (prod) lo elegís vos

======================================================================
🔵 5. CONDITIONAL RENDERING
======================================================================

Mostrar/ocultar cosas según un estado.

Ej con &&:
{mostrar && <p>Hola</p>}

Ej con ternario:
{checked ? <Componente /> : <Otro />}

Caso típico:
{!modoAgregar && <ListaProductos />}
{modoAgregar && <InputsParaAgregar />}

======================================================================
🔵 6. FETCH – CONEXIÓN FRONT ↔ BACK
======================================================================

✔ fetch sirve para hacer pedidos a un servidor (backend)

----------------
➡ GET (PEDIR DATOS)
----------------
useEffect(() => {
  async function traer() {
    const res = await fetch("http://localhost:4000/productos");
    const data = await res.json();
    setProductos(data.productos);
  }
  traer();
}, []);

✔ GET no lleva body
✔ Siempre usá response.json()

----------------
➡ POST (ENVIAR DATOS)
----------------
async function crearProducto() {
  const datos = {
    nombre: nombreNuevo,
    descripcion: descNueva
  };

  const res = await fetch("http://localhost:4000/crearProducto", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos)
  });

  const data = await res.json();
}

✔ POST lleva:
  - method
  - headers
  - JSON.stringify(datos)

======================================================================
🔵 7. SPREAD OPERATOR (...)
======================================================================

Sirve para copiar arrays/objetos sin romperlos.
React necesita COPIAS nuevas, no cosas modificadas.

Agregar un producto a la lista:
setProductos([...productos, nuevoProd]);

❌ productos.push(nuevoProd) → NO funciona en React

======================================================================
🔵 8. useEffect
======================================================================

useEffect(() => {
  acciónAlCargar();
}, []);

✔ [] → significa que se ejecuta SOLO al cargar la página
✔ Ideal para hacer GET

======================================================================
🔵 9. MANEJO DE INPUTS
======================================================================

<input value={nombre} onChange={(e) => setNombre(e.target.value)} />

✔ e.target.value = valor escrito por el usuario
✔ Siempre con useState

======================================================================
🔵 10. BACKEND (NODE + EXPRESS)
======================================================================

✔ Un endpoint es una ruta del servidor que recibe pedidos.

----------------
➡ GET /productos
----------------
app.get('/productos', async (req, res) => {
  const respuesta = await realizarQuery("SELECT * FROM Productos");
  res.json({ productos: respuesta });
});

----------------
➡ POST /crearProducto
----------------
app.post('/crearProducto', async (req, res) => {
  const { nombre, descripcion } = req.body;

  await realizarQuery(`
    INSERT INTO Productos (nombre, descripcion)
    VALUES ("${nombre}", "${descripcion}")
  `);

  res.json({ creado: true });
});

=================================================================
/*
======================================================================
🌟 CÓDIGO COMPLETO EXPLICADO — TODO EN UN SOLO COMENTARIO 🌟
======================================================================

======================================================================
🔹 COMPONENTE TITLE
======================================================================

Es un h1 que recibe por props un texto.

export default function Title({ text }) {
  return (
    <h1>{text}</h1>
  );
}

======================================================================
🔹 COMPONENTE DESCRIPTION
======================================================================

Es un <p> que recibe por props un texto.

export default function Description({ text }) {
  return (
    <p>{text}</p>
  );
}

======================================================================
🔹 COMPONENTE BUTTON
======================================================================

Recibe:
 - text → texto del botón
 - onClick → función que se ejecuta cuando lo apretás

export default function Button({ text, onClick }) {
  return (
    <button onClick={onClick}>
      {text}
    </button>
  );
}

======================================================================
🔹 COMPONENTE COMPUESTO "Producto"
======================================================================

Usa Title, Description y Button.
Recibe por props:
  - titulo
  - descripcion

import Title from "./Title";
import Description from "./Description";
import Button from "./Button";

export default function Producto({ titulo, descripcion }) {
  return (
    <div style={{ border: "1px solid black", padding: 10, marginBottom: 10 }}>
      <Title text={titulo} />
      <Description text={descripcion} />
      <Button text="Comprar" onClick={() => alert("Comprado")} />
    </div>
  );
}

/*
======================================================================
🌟 CÓDIGO COMPLETO EXPLICADO — TODO EN UN SOLO COMENTARIO 🌟
======================================================================

======================================================================
🔹 COMPONENTE TITLE
======================================================================

Es un h1 que recibe por props un texto.

export default function Title({ text }) {
  return (
    <h1>{text}</h1>
  );
}

======================================================================
🔹 COMPONENTE DESCRIPTION
======================================================================

Es un <p> que recibe por props un texto.

export default function Description({ text }) {
  return (
    <p>{text}</p>
  );
}

======================================================================
🔹 COMPONENTE BUTTON
======================================================================

Recibe:
 - text → texto del botón
 - onClick → función que se ejecuta cuando lo apretás

export default function Button({ text, onClick }) {
  return (
    <button onClick={onClick}>
      {text}
    </button>
  );
}

======================================================================
🔹 COMPONENTE COMPUESTO "Producto"
======================================================================

Usa Title, Description y Button.
Recibe por props:
  - titulo
  - descripcion

import Title from "./Title";
import Description from "./Description";
import Button from "./Button";

export default function Producto({ titulo, descripcion }) {
  return (
    <div style={{ border: "1px solid black", padding: 10, marginBottom: 10 }}>
      <Title text={titulo} />
      <Description text={descripcion} />
      <Button text="Comprar" onClick={() => alert("Comprado")} />
    </div>
  );
}

======================================================================
🔹 PAGE PRINCIPAL — usa: useState, useEffect, fetch, map, conditional rendering
======================================================================

"use client";
import { useEffect, useState } from "react";
import Producto from "./Producto";

export default function Page() {

  --------------------------------------------------------------------
  ESTADOS
  --------------------------------------------------------------------

  ✔ Lista de productos traídos del backend
  const [productos, setProductos] = useState([]);

  ✔ Checkbox para cambiar entre ver lista / agregar producto
  const [modoAgregar, setModoAgregar] = useState(false);

  ✔ Estados de los inputs
  const [nombreNuevo, setNombreNuevo] = useState("");
  const [descNueva, setDescNueva] = useState("");


  --------------------------------------------------------------------
  FETCH GET: traer productos al cargar la página
  --------------------------------------------------------------------

  useEffect(() => {
    async function traerProductos() {
      try {
        const res = await fetch("http://IP:4000/productos");  // ← GET
        const data = await res.json();

        setProductos(data.productos); // Guardamos el array
      } catch (e) {
        console.log("Error al traer productos:", e);
      }
    }

    traerProductos();
  }, []); // [] = solo se ejecuta al cargar


  --------------------------------------------------------------------
  FUNCIÓN PARA AGREGAR PRODUCTO — POST
  --------------------------------------------------------------------

  async function agregarProducto() {

    // Objeto EXACTO que pide el backend
    const nuevoProducto = {
      nombre: nombreNuevo,
      descripcion: descNueva
    };

    try {
      const res = await fetch("http://IP:4000/crearProducto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoProducto),
      });

      const data = await res.json();
      console.log("Respuesta del back:", data);

      // Agregamos el producto localmente a la lista
      setProductos([...productos, nuevoProducto]);

      // Limpiar inputs
      setNombreNuevo("");
      setDescNueva("");

      // Volver a la lista
      setModoAgregar(false);

    } catch (e) {
      console.log("Error al crear producto:", e);
    }
  }


  --------------------------------------------------------------------
  RETURN → LO QUE SE VE EN PANTALLA
  --------------------------------------------------------------------

  return (
    <div>

      ---------------------------------------------------------------
      🔹 Checkbox para activar / desactivar modo agregar
      ---------------------------------------------------------------

      <div style={{ marginBottom: 20 }}>
        <input
          type="checkbox"
          checked={modoAgregar}
          onChange={() => setModoAgregar(!modoAgregar)}
        />
        <label style={{ marginLeft: 8 }}>Agregar nuevo producto</label>
      </div>


      ---------------------------------------------------------------
      🔹 SI modoAgregar ES FALSE → MOSTRAR LISTA
      ---------------------------------------------------------------

      {!modoAgregar && (
        <div>
          <h2>Lista de productos</h2>

          {productos.map((prod, index) => (
            <Producto
              key={index}
              titulo={prod.nombre}
              descripcion={prod.descripcion}
            />
          ))}
        </div>
      )}


      ---------------------------------------------------------------
      🔹 SI modoAgregar ES TRUE → MOSTRAR FORMULARIO
      ---------------------------------------------------------------

      {modoAgregar && (
        <div>
          <h2>Agregar producto</h2>

          <input
            placeholder="Nombre del producto"
            value={nombreNuevo}
            onChange={(e) => setNombreNuevo(e.target.value)}
          />

          <br /><br />

          <input
            placeholder="Descripción"
            value={descNueva}
            onChange={(e) => setDescNueva(e.target.value)}
          />

          <br /><br />

          <button onClick={agregarProducto}>Agregar</button>
        </div>
      )}
    </div>
  );
}

/*
======================================================================
🌟 FETCH COMPLETO — GET, POST, PUT, DELETE (con ejemplos reales)
======================================================================

Este comentario gigante contiene:

✔ Cómo hacer un GET  
✔ Cómo hacer un POST  
✔ Cómo hacer un PUT  
✔ Cómo hacer un DELETE  
✔ Qué body se manda en cada caso  
✔ Qué headers usar  
✔ Cómo manejar JSON  
✔ Ejemplos súper claros que podés copiar para el examen  

======================================================================
🔵 1. FETCH GET — Obtener datos del backend
======================================================================

✔ El método por defecto de fetch es GET  
✔ No lleva body  
✔ Solo pedís datos

async function traerProductos() {
  try {
    const response = await fetch("http://localhost:4000/productos");

    const data = await response.json();

    console.log("Productos traídos:", data);

  } catch (error) {
    console.log("Error en GET:", error);
  }
}

======================================================================
🔵 2. FETCH POST — Enviar datos para CREAR algo
======================================================================

✔ Siempre se usa method: "POST"
✔ Siempre se manda body con JSON.stringify
✔ Siempre se usa Content-Type: "application/json"

async function crearProducto() {

  const nuevoProducto = {
    nombre: "Gaseosa",
    descripcion: "Coca cola de vidrio"
  };

  try {
    const response = await fetch("http://localhost:4000/crearProducto", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(nuevoProducto)
    });

    const data = await response.json();
    console.log("Producto creado:", data);

  } catch (error) {
    console.log("Error en POST:", error);
  }
}

======================================================================
🔵 3. FETCH PUT — Actualizar algún dato existente
======================================================================

✔ PUT se usa para EDITAR o ACTUALIZAR
✔ Se envía un cuerpo igual que en POST, con JSON.stringify
✔ El backend recibe datos por req.body

async function actualizarProducto() {

  const productoActualizado = {
    id: 5,                       // ID del producto a modificar
    nombre: "Sprite 1.5L",
    descripcion: "Botella grande"
  };

  try {
    const response = await fetch("http://localhost:4000/actualizarProducto", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(productoActualizado)
    });

    const data = await response.json();

    console.log("Producto actualizado:", data);

  } catch (error) {
    console.log("Error en PUT:", error);
  }
}

======================================================================
🔵 4. FETCH DELETE — Eliminar algo del backend
======================================================================

✔ DELETE puede enviar body, según el backend  
✔ Se usa method: "DELETE"
✔ También se manda JSON con lo que haya que borrar

async function eliminarProducto() {
  
  const datos = {
    id: 5
  };

  try {
    const response = await fetch("http://localhost:4000/eliminarProducto", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(datos)
    });

    const data = await response.json();


    /*
==================== 📌 EXPLICACIÓN COMPLETA ==================
========================= useSearchParams =====================
🔵 ¿Qué es useSearchParams?

Es un hook de Next.js que sirve para LEER los valores que vienen en la URL después del signo "?".

Ejemplo de URL:
/subastas?username=sofi&alumnoId=7

Todo lo que viene después del "?" se llama QUERY PARAMS.
Cada parámetro tiene un "nombre" y un "valor":
username = sofi
alumnoId = 7

useSearchParams te permite ACCEDER a esos valores dentro de la página.

Ejemplo básico:

const searchParams = useSearchParams();
const username = searchParams.get("username");
const alumnoId = searchParams.get("alumnoId");

✔ Si la URL es "/subastas?username=Sofi&alumnoId=3":
username → "Sofi"
alumnoId → "3"

🔵 ¿Para qué sirve?

Sirve para PASAR datos de una página a otra SIN usar:
- backend
- localStorage
- props
- useState (aunque se puede combinar)

Es super útil para recuperatorios y trabajos donde:
- completás un formulario en /registro
- mandás esos datos a /subastas usando la URL

🔵 Cómo mandar parámetros desde otra página:

Ejemplo en /registro.jsx:

router.push(/subastas?username=${username}&alumnoId=${alumnoId});

Esto pone los datos en la URL.

🔵 Cómo leerlos en /subastas.jsx:

const params = useSearchParams();
const username = params.get("username");
const alumnoId = params.get("alumnoId");

IMPORTANTE:
Los nombres ("username" y "alumnoId") deben ser EXACTAMENTE IGUALES a los que pusiste en la URL.

🔵 ¿Necesito useState?

NO siempre.

Pero es RECOMENDADO guardarlos porque:
✔ el componente se va a re-renderizar
✔ usarás esos valores varias veces
✔ necesitás pasarlos por props o sockets
✔ necesitás validarlos

Ejemplo recomendado:

const [username] = useState(params.get("username"));
const [alumnoId] = useState(params.get("alumnoId"));

🔵 ¿Qué pasa si el parámetro NO existe?

params.get("loQueSea") devolverá → null

🔵 Relación con router.push

Lo que vos mandás desde router.push es EXACTAMENTE lo que vas a leer con useSearchParams.

Ejemplo:
router.push("/subastas?color=rojo&size=XL");

Después en /subastas:

params.get("color") → "rojo"
params.get("size") → "XL"

🔵 Ejemplo COMPLETO de uso real:
/registro.jsx

function irASubasta() {
router.push(/subastas?username=${username}&alumnoId=${alumnoId});
}

/subastas.jsx

import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SubastasPage() {
const params = useSearchParams();

const [username] = useState(params.get("username"));
const [alumnoId] = useState(params.get("alumnoId"));

return (
<div>
<h1>Sala de Subastas</h1>
<p>Bienvenido: {username}</p>
<p>Número de sala: {alumnoId}</p>
</div>
);
}

🔵 ¿Cuándo usar useSearchParams?

✔ cuando querés recibir datos de otra página
✔ cuando necesitás pasarlos a sockets
✔ cuando te sirven para condicional rendering
✔ cuando necesitás identificador de usuario
✔ cuando querés inicializar estados con valores de URL

🔵 RESUMEN RÁPIDO PARA ACORDARTE SIEMPRE

useSearchParams LEE lo que está en la URL después del '?'

get("nombre") te da el valor

usá los mismos nombres que usaste en el router.push

podés guardarlos en estados para comodidad

podés usar esos valores para sockets, condicional rendering, etc.

==============================================================
==================== FIN EXPLICACIÓN =========================


    console.log("Producto eliminado:", data);

  } catch (error) {
    console.log("Error en DELETE:", error);
  }
}

======================================================================
📌 RESUMEN DE MEMORIA PARA EL EXAMEN
======================================================================

🔹 GET  → solo URL
fetch(url)

🔹 POST → headers + body + JSON.stringify
fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(obj)
})

🔹 PUT  → igual que POST pero con method "PUT"

🔹 DELETE → igual que POST pero con method "DELETE"

------------------------------------------

🔹 response.json()   → SIEMPRE después del await fetch
🔹 try {} catch {}   → para evitar errores
🔹 body SIEMPRE es JSON.stringify()

======================================================================
FIN DEL COMENTARIO COMPLETO 🌟
======================================================================
/*  
