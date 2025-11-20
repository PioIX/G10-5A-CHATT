/* ==========================================================================
   EXAMEN COMPLETO RESUELTO (COMENTARIO GIGANTE) — EXPLICACIÓN LÍNEA A LÍNEA
   ==========================================================================
   Archivos incluidos (para copiar/pegar por separado en tu proyecto):
     - /app/registro/page.jsx
     - /app/components/Subasta.js
     - /app/components/OfertaDeSubasta.js
     - /app/subastas/page.jsx
     - /app/hooks/useSocket.js

   Instrucciones:
     - Cada "archivo" está incluido abajo con su código y EXPLICACIONES por línea.
     - Si querés usarlo tal cual: copia la parte del archivo (sin los comentarios
       que marcan el inicio del bloque) y pegalo en el archivo correspondiente.
     - Lee las explicaciones: te cuentan por qué está cada línea y qué hace.
   ========================================================================== */

///////////////////////////////////////////////////////////////////////////////
// /app/hooks/useSocket.js
///////////////////////////////////////////////////////////////////////////////
/* Este hook crea y devuelve una conexión socket segura para usar en Next.js.
   Explicación: Next.js puede renderizar en servidor y cliente; crear sockets
   fuera de un hook puede generar conexiones duplicadas o errores. Por eso
   usamos un hook que crea el socket solo en cliente y lo limpia al desmontar.
*/

import { useEffect, useState } from "react";               // importo hooks de React
import { io } from "socket.io-client";                     // importo la función para crear la conexión socket

export default function useSocket(url) {                   // exporto por defecto un hook que recibe la URL del backend
  const [socket, setSocket] = useState(null);             // estado para guardar la instancia del socket
  const [isConnected, setIsConnected] = useState(false);  // estado booleano para saber si estamos conectados

  useEffect(() => {                                       // efecto que corre cuando la URL cambia (o al montar)
    if (!url) return;                                    // protección: si no hay URL, no intento conectar

    // 1) Crear la conexión con opciones seguras (transport websocket evita polling)
    const s = io(url, { transports: ["websocket"], autoConnect: true });

    // 2) Guardar la instancia en el estado para que el componente la use
    setSocket(s);

    // 3) Listeners básicos sobre la propia conexión
    s.on("connect", () => {                              // cuando el socket se conecta correctamente
      setIsConnected(true);                              // actualizo el estado para indicar conexión
      // console.log("Socket conectado:", s.id);        // (opcional) ayuda para debug
    });

    s.on("disconnect", () => {                           // cuando se desconecta
      setIsConnected(false);                             // actualizo el estado
    });

    // 4) Cleanup: cuando el componente que usa el hook se desmonta,
    // desconectamos el socket para evitar conexiones colgadas.
    return () => {
      s.disconnect();                                    // cierra la conexión
      setSocket(null);                                   // limpia el estado por seguridad
      setIsConnected(false);
    };
  }, [url]);                                             // dependencias: si cambia la url, recrea la conexión

  // Devuelvo tanto el socket como el estado de conexión
  return { socket, isConnected };
}

///////////////////////////////////////////////////////////////////////////////
// /app/registro/page.jsx
///////////////////////////////////////////////////////////////////////////////
/* Página /registro:
   - Pide username y alumnoId
   - Valida username >= 3 caracteres
   - Navega a /subastas pasando username y alumnoId en query string
   - Incluye como comentario la teoría pedida sobre CLSX
*/

"use client";                                            // marca el componente como "cliente" en Next.js
import { useState } from "react";                        // hook para manejar estados
import { useRouter } from "next/navigation";             // hook de Next.js para navegar

/* ===== Pregunta teórica: CLSX (RESPONDER COMO COMENTARIO) =====
   CLSX se utiliza para componer clases CSS de forma condicional y
   legible. Ventajas frente a concatenar strings:
   - evita espacios dobles y strings vacíos
   - hace el código más legible cuando hay muchas clases condicionales
   - permite pasar objetos o arrays para manejar múltiples condiciones
   Ejemplo: className={clsx("btn", isActive && "btn-active")}
   En resumen: clsx mejora la legibilidad y evita errores al combinar clases.
*/

export default function RegistroPage() {
  // estado para el nombre del usuario (username)
  const [username, setUsername] = useState("");
  // estado para el id de alumno (alumnoId)
  const [alumnoId, setAlumnoId] = useState("");
  // router para navegar programáticamente
  const router = useRouter();

  // función que se ejecuta al presionar el botón "Ir a Subastas"
  function irASubastas() {
    // validación: nombre mínimo 3 caracteres
    if (username.trim().length < 3) {
      // muestro una alerta simple (podrías usar modal si quieres)
      alert("El nombre debe tener al menos 3 caracteres");
      return; // no navegamos si no pasa la validación
    }

    // si está todo ok, navegamos a /subastas pasando los parámetros por query
    // IMPORTANTE: respetar los nombres "username" y "alumnoId"
    router.push(`/subastas?username=${encodeURIComponent(username)}&alumnoId=${encodeURIComponent(alumnoId)}`);
    // encodeURIComponent evita problemas si el usuario pone espacios o caracteres especiales
  }

  // JSX renderizado por la página
  return (
    <div style={{ padding: 20 }}>
      {/* Título */}
      <h1>Registro</h1>

      {/* Input controlado para username */}
      <input
        placeholder="Nombre (mínimo 3 caracteres)"
        value={username}
        onChange={(e) => setUsername(e.target.value)} // actualizo el estado cada vez que el usuario escribe
      />

      {/* Conditional rendering: si escribió y es < 3, muestro el error */}
      {username.length > 0 && username.trim().length < 3 && (
        <p style={{ color: "red" }}>El nombre debe tener mínimo 3 letras</p>
      )}

      <br /><br />

      {/* Input controlado para alumnoId (número) */}
      <input
        placeholder="ID de alumno"
        type="number"
        value={alumnoId}
        onChange={(e) => setAlumnoId(e.target.value)}
      />

      <br /><br />

      {/* Botón que dispara la validación y la navegación */}
      <button onClick={irASubastas}>Ir a Subastas</button>
    </div>
  );
}

///////////////////////////////////////////////////////////////////////////////
// /app/components/Subasta.js
///////////////////////////////////////////////////////////////////////////////
/* Componente Subasta:
   - Recibe por props: producto, precioActual, mejorPostor
   - Muestra la info y usa conditional rendering para mejorPostor
*/

import React from "react"; // no obligatorio pero claro

export default function Subasta({ producto, precioActual, mejorPostor }) {
  // componente simple que renderiza la información de la subasta
  return (
    <div style={{ border: "1px solid #ccc", padding: 12, borderRadius: 6, marginBottom: 12 }}>
      {/* Nombre del producto */}
      <h2 style={{ margin: 0 }}>{producto}</h2>

      {/* Precio actual */}
      <p style={{ margin: "6px 0" }}>Precio actual: ${precioActual}</p>

      {/* Conditional rendering: si existe mejorPostor lo mostramos, si no un mensaje alternativo */}
      {mejorPostor ? (
        <p style={{ margin: 0 }}>Mejor postor: {mejorPostor}</p>
      ) : (
        <p style={{ margin: 0, fontStyle: "italic" }}>No existe un mejor postor.</p>
      )}
    </div>
  );
}

///////////////////////////////////////////////////////////////////////////////
// /app/components/OfertaDeSubasta.js
///////////////////////////////////////////////////////////////////////////////
/* Componente OfertaDeSubasta:
   - Recibe onChangeOferta y onClickRealizarOferta por props
   - Muestra título, input numérico y botón
*/

import React from "react";

export default function OfertaDeSubasta({ onChangeOferta, onClickRealizarOferta, valor }) {
  // valor (opcional) es el valor actual del input que viene del padre
  return (
    <div style={{ marginTop: 12 }}>
      {/* Título */}
      <h3>Realizar nueva oferta</h3>

      {/* Input numérico controlado por la función onChange enviada desde el padre */}
      <input
        type="number"
        placeholder="Monto (ej: 10, 20, 30)"
        value={valor ?? ""}
        onChange={(e) => onChangeOferta(e.target.value)}
      />

      {/* Botón para realizar la oferta */}
      <button onClick={onClickRealizarOferta} style={{ marginLeft: 8 }}>
        Ofertar
      </button>
    </div>
  );
}

///////////////////////////////////////////////////////////////////////////////
// /app/subastas/page.jsx
///////////////////////////////////////////////////////////////////////////////
/* Página /subastas:
   - Lee username y alumnoId desde la URL (useSearchParams)
   - Usa useSocket para conectar al backend del examen
   - Emite join_subasta al hacer click en "Unirse"
   - Escucha: joined_OK_subasta, nueva_oferta, subasta_finalizada
   - Guarda subasta en estado y muestra el componente Subasta
   - Valida que la oferta sea mayor al precioActual antes de emitir realizar_oferta
   - Guarda un historial de las últimas 5 ofertas y las muestra
*/

"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";           // para leer los parámetros de la URL
import useSocket from "../hooks/useSocket";                 // nuestro hook que crea el socket seguro

import Subasta from "../components/Subasta";                // componente que muestra la subasta
import OfertaDeSubasta from "../components/OfertaDeSubasta";// componente para ingresar ofertas

export default function SubastasPage() {
  // 1) LEER LOS PARAMETROS DESDE LA URL
  const searchParams = useSearchParams();                   // hook de Next.js para leer query string
  const username = searchParams.get("username");            // nombre de usuario pasado desde /registro
  const alumnoId = searchParams.get("alumnoId");            // id de sala (alumno)

  // 2) CONECTAR EL SOCKET usando el hook
  const { socket, isConnected } = useSocket("http://10.1.5.137:4000");
  // - socket: la instancia del socket
  // - isConnected: booleano que indica si la conexión está lista

  // 3) ESTADOS LOCALES IMPORTANTES
  const [subasta, setSubasta] = useState(null);             // guarda el objeto subasta actual
  const [monto, setMonto] = useState("");                   // input controlado para la oferta
  const [historial, setHistorial] = useState([]);           // historial de las últimas 5 ofertas
  const [estaConectadoSala, setEstaConectadoSala] = useState(false); // indica si el usuario ya se unió a la sala
  const [mensajeFinal, setMensajeFinal] = useState("");     // mensaje cuando la subasta finaliza

  /* --------------------------------------------------------
     4) Función para unirse a la sala de subasta (emit)
     -------------------------------------------------------- */
  function unirseSala() {
    // protección: si socket aún no existe no hago nada
    if (!socket) {
      alert("Conexión no lista, por favor espera un momento.");
      return;
    }

    // Emito el evento que pide el examen: join_subasta con { alumnoId }
    socket.emit("join_subasta", { alumnoId });

    // Marco localmente que intenté unirme (esto permite mostrar número de sala, etc.)
    setEstaConectadoSala(true);
  }

  /* --------------------------------------------------------
     5) useEffect: listeners para eventos que EL BACK nos manda
     -------------------------------------------------------- */
  useEffect(() => {
    // Si no existe la conexión, no seteamos listeners
    if (!socket) return;

    // a) Escucho la confirmación de ingreso con los datos iniciales de la subasta
    socket.on("joined_OK_subasta", (data) => {
      // data debe ser un objeto del tipo { id, producto, precioActual, ... }
      setSubasta(data);         // guardo el objeto subasta en el estado
      setMensajeFinal("");      // limpio cualquier mensaje final previo
    });

    // b) Escucho cuando llega una nueva oferta (actualiza precio y mejorPostor)
    socket.on("nueva_oferta", (data) => {
      setSubasta(data);         // actualizo la subasta con los datos recibidos

      // Actualizo historial: agrego la oferta nueva al comienzo y mantengo solo 5
      setHistorial((prev) => {
        const nuevo = [data, ...prev]; // data representa la oferta actual con timestamp y mejorPostor
        return nuevo.slice(0, 5);      // me quedo con los 5 primeros
      });
    });

    // c) Escucho cuando la subasta finaliza (según el backend: después de X ofertas)
    socket.on("subasta_finalizada", (data) => {
      // el backend puede enviar la nueva subasta en data.subastaNueva o similar
      setMensajeFinal("La subasta ha finalizado! Por favor ingrese nuevo valor para comenzar otra.");
      // Si el backend nos envía una subasta para reiniciar:
      if (data && data.subastaNueva) {
        setSubasta(data.subastaNueva); // reinicio la subasta con la nueva información
      } else {
        // si no hay subasta nueva, puedo limpiar el estado o dejar la existente
        setSubasta(null);
      }

      // deshabilito el botón de ofertar en la UI (lo controla la condición subasta !== null)
      setEstaConectadoSala(false);
    });

    // d) Cleanup: quitar listeners cuando socket cambie o al desmontar
    return () => {
      socket.off("joined_OK_subasta");
      socket.off("nueva_oferta");
      socket.off("subasta_finalizada");
    };
  }, [socket]); // dependencia: ejecutar cuando el socket esté listo

  /* --------------------------------------------------------
     6) Función para enviar oferta (validación + emit)
     -------------------------------------------------------- */
  function enviarOferta() {
    if (!socket) {
      alert("Conexión no lista");
      return;
    }

    if (!subasta) {
      alert("Aún no estás en una subasta");
      return;
    }

    const montoNum = Number(monto); // convierto el valor del input a número

    // validación: la oferta debe ser mayor al precioActual
    if (isNaN(montoNum) || montoNum <= subasta.precioActual) {
      alert("La oferta debe ser un número mayor al precio actual.");
      return;
    }

    // Emito el evento requerido por el examen
    socket.emit("realizar_oferta", {
      usuario: username, // nombre obtenido de la URL
      monto: montoNum
    });

    // limpio el input localmente
    setMonto("");
  }

  /* --------------------------------------------------------
     7) Renderizado (JSX) — Conditional rendering según estados
     -------------------------------------------------------- */
  return (
    <div style={{ padding: 20 }}>
      <h1>Subasta en vivo</h1>

      {/* Mostrar número de sala solo cuando intentamos o logramos conectarnos */}
      {estaConectadoSala && <p>Número de sala: {alumnoId}</p>}

      {/* Botón para unirse a la sala (oculto si ya se unió) */}
      {!estaConectadoSala && (
        <button onClick={unirseSala} disabled={!isConnected}>
          Unirse a la sala de subasta
        </button>
      )}

      <br /><br />

      {/* Mensaje final de la subasta */}
      {mensajeFinal && (
        <div style={{ color: "red", marginBottom: 12 }}>
          {mensajeFinal}
        </div>
      )}

      {/* Mostrar la subasta (si existe) */}
      {subasta ? (
        <>
          {/* componente Subasta muestra producto, precioActual, mejorPostor */}
          <Subasta
            producto={subasta.producto}
            precioActual={subasta.precioActual}
            mejorPostor={subasta.mejorPostor}
          />

          {/* Componente para ingresar la oferta */}
          {/* Le paso el valor actual (monto), la función para cambiarlo y la función que realiza la oferta */}
          <OfertaDeSubasta
            valor={monto}
            onChangeOferta={setMonto}
            onClickRealizarOferta={enviarOferta}
          />

          {/* Deshabilitar botón de ofertar: si no hay subasta activa */}
          {/* Nota: en este diseño el botón ya es el de OfertaDeSubasta; si querés deshabilitarlo,
              podrías pasar una prop `disabled={!subasta}` y usarla en ese componente. */}
        </>
      ) : (
        // Si no hay subasta: mostrar mensaje (aun cuando no se unió)
        <p>No estás conectado a ninguna subasta.</p>
      )}

      <br />

      {/* HISTORIAL DE LAS ÚLTIMAS 5 OFERTAS */}
      <h3>Historial de ofertas</h3>
      {historial.length === 0 ? (
        <p>No hay ofertas.</p>
      ) : (
        historial.map((h, i) => (
          <div key={i} >
            {/* cada oferta del historial debe tener postor, monto y timestamp */}
            <strong>{h.mejorPostor || h.postor || "Anónimo"}</strong>: ${h.precioActual || h.monto} —{" "}
            <small>{h.timestamp || "sin fecha"}</small>
          </div>
        ))
      )}
    </div>
  );
}

/* ==========================================================================
   FIN DEL COMENTARIO GIGANTE
   ==========================================================================

   NOTAS FINALES / CONSEJOS PARA EL EXAMEN:
   - Asegurate de correr DOS instancias: npm run dev (3000) y npm run dev -- -p 3001
     para probar la comunicación en tiempo real entre dos clientes.
   - En consola del navegador (F12) vas a ver logs si algo llega o para debug.
   - Respetá exactamente los nombres de eventos que te piden: join_subasta,
     realizar_oferta, joined_OK_subasta, nueva_oferta, subasta_finalizada.
   - Usá encodeURIComponent al pasar datos por URL para evitar problemas con espacios.
   - Si el hook useSocket ya te lo dieron en el enunciado, usalo. Si no, el hook que
     incluí arriba funciona bien para el examen.
   - No subas node_modules ni .next a la entrega (te restan puntos).
   - Lee siempre el PDF del enunciado y respeta la estructura pedida.

   Si querés, te lo puedo devolver SIN comentarios para que lo pegues directamente
   como archivos listos. ¿Lo querés así también?
*/


/*
  Explicación del uso de Socket.IO en este componente:

  En esta página se maneja la comunicación en tiempo real con el servidor usando Socket.IO.
  La idea general es siempre la misma sin importar la consigna del profesor: conectarse al
  backend, unirse a alguna sala o canal, emitir acciones (como enviar datos) y escuchar
  respuestas del servidor que actualizan la interfaz automáticamente.

  1) Conexión al servidor:
     Al montar el componente creo una conexión con io("http://10.1.5.137:4000") y guardo
     ese socket en un estado. Esto permite mantener la comunicación abierta mientras la
     página está activa.

  2) Unirse a una sala o grupo:
     La función `unirseASala()` usa:
         socket.emit("join_subasta", { alumnoId });
     Pero este mismo patrón sirve para cualquier consigna, por ejemplo:
         socket.emit("join_room", { sala });
         socket.emit("unirse", { id });
         socket.emit("login", { usuario });
     La idea es siempre “avisarle al servidor que este cliente quiere participar”.

  3) Escuchar eventos del servidor:
     Uso `socket.on(...)` para reaccionar a los cambios que el servidor envía. En este caso:
        - "joined_OK_subasta" → trae datos iniciales
        - "nueva_oferta" → avisa que llegó información nueva en tiempo real
        - "subasta_finalizada" → indica que terminó un ciclo y hay que actualizar estados

     Aunque acá los nombres son de subastas, la lógica sirve para cualquier actividad en vivo:
       chat: "nuevo_mensaje"
       juego: "movimiento"
       turnos: "actualizar_turno"
       trivia: "nueva_pregunta"

     La idea central es que cada vez que llega un evento del servidor, se actualiza el estado
     correspondiente (por ejemplo setSubasta, setHistorial, setFinalizada), y React vuelve a
     renderizar la interfaz sin recargar la página.

  4) Emitir acciones del usuario:
     La función `enviarOferta()` hace:
         socket.emit("realizar_oferta", { usuario: nombre, monto });
     Esto también es universal para cualquier consigna. En un chat sería “enviar_mensaje”,
     en un juego “mover”, en un sistema de turnos “pedir_turno”, etc.

     Lo importante es: cada vez que el usuario hace algo, esa acción se notifica al servidor
     mediante un emit para que otros clientes también vean el cambio.

  5) Estados y renderizado:
     Cada evento recibido actualiza un estado de React:
         subasta       → datos principales
         historial     → últimas acciones (máximo 5)
         finalizada    → controla el renderizado condicional
     Estos estados pueden llamarse diferente según la consigna, pero siempre cumplen el
     mismo rol: guardar lo que llega del servidor para mostrarlo en pantalla.

  En resumen:
  - Se crea la conexión.
  - Se emiten acciones del usuario.
  - Se escuchan actualizaciones del servidor.
  - Se actualizan estados para que la interfaz muestre los cambios en tiempo real.

  El flujo es siempre el mismo, sin importar si el profesor pide subastas, chat,
  tablero, ranking, trivia o cualquier ejercicio con varios usuarios.
*/
