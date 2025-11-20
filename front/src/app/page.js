import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image
          className={styles.logo}
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol>
          <li>
            Get started by editing <code>src/app/page.js</code>.
          </li>
          <li>Save and see your changes instantly.</li>
        </ol>

        <div className={styles.ctas}>
          <a
            className={styles.primary}
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className={styles.logo}
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.secondary}
          >
            Read our docs
          </a>
        </div>
      </main>
      <footer className={styles.footer}>
        <a
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
/*  
=====================================================================
🚀 BIBLIA DEFINITIVA PARA USAR SOCKET.IO EN EL FRONT EN UN EXAMEN 🚀
=====================================================================

Este comentario explica EXACTAMENTE cómo implementar sockets en una 
evaluación, paso a paso, nivel tonto-friendly, sin back, sin magia.

=====================================================================
⭐ PASO 1 — IMPORTAR Y CREAR LA CONEXIÓN
=====================================================================

En un examen SIEMPRE tenés que empezar así:

"use client";
import { io } from "socket.io-client";
import { useEffect, useState } from "react";

¿Por qué?
Porque socket.io funciona SOLO en el cliente (navegador), no del lado del servidor.

Ahora vamos a conectarnos:

const socket = io("http://IP_DEL_BACK:4000");

❗ PERO ESTO NO SE PONE DIRECTO EN EL CÓDIGO.
¿Por qué?  
Porque si lo ponés ahí, React lo ejecuta mil veces → crea mil conexiones → se rompe todo.

👑 LA FORMA CORRECTA → ADENTRO DE UN useEffect:

useEffect(() => {
  const s = io("http://10.1.5.137:4000");  // se conecta solo una vez
  setSocket(s);                            // guardamos el socket en estado

  return () => s.disconnect();             // cuando salgo de la página, lo cierro
}, []);

✔ Esto conecta al servidor UNA sola vez.  
✔ Evita duplicar conexiones  
✔ Limpia la conexión cuando salís de la página (buena práctica)

=====================================================================
⭐ PASO 2 — ESTADOS QUE VAS A ACTUALIZAR
=====================================================================

En TODOS los exámenes te van a pedir mostrar info.  
Para eso necesitás estados:

const [socket, setSocket] = useState(null);     // guardo la conexión
const [subasta, setSubasta] = useState(null);   // info de la subasta
const [mensajeError, setMensajeError] = useState(""); // errores
const [historial, setHistorial] = useState([]); // últimas ofertas

✔ Todo lo que venga del socket se guarda en estados.  
✔ Todo lo que mostraste en pantalla sale de estados.

=====================================================================
⭐ PASO 3 — EMITIR EVENTOS (LO QUE EL EXAMEN TE PIDE)
=====================================================================

En los exámenes te dicen:

"Emití join_subasta con { alumnoId }".

Eso SIEMPRE se hace así:

function unirse() {
  socket.emit("join_subasta", { alumnoId });
}

🧠 IMPORTANTE:
- SOLO se emite cuando el usuario hace algo (click)
- NUNCA se emite dentro del render
- NUNCA se emite dentro de un useEffect sin control

=====================================================================
⭐ PASO 4 — ESCUCHAR LOS EVENTOS DEL SERVIDOR
=====================================================================

ESTO ES LO MÁS IMPORTANTE DEL EXAMEN.

Cuando el backend te envía algo, lo tenés que escuchar.
Ejemplos de eventos típicos:

✔ joined_OK_subasta  
✔ nueva_oferta  
✔ subasta_finalizada  

Para escuchar SIEMPRE se usa un useEffect:

useEffect(() => {
  if (!socket) return;   // si el socket no existe aún, no escucho nada

  socket.on("joined_OK_subasta", (data) => {
    setSubasta(data); // guardo la subasta inicial
  });

  socket.on("nueva_oferta", (data) => {
    setSubasta(data); // actualizo info en tiempo real
  });

  socket.on("subasta_finalizada", (data) => {
    setMensajeError("La subasta terminó");
  });

  // Limpieza: evitar eventos duplicados
  return () => {
    socket.off("joined_OK_subasta");
    socket.off("nueva_oferta");
    socket.off("subasta_finalizada");
  };

}, [socket]);

📌 ¿Qué significa esto?

→ CUANDO LLEGA el evento, guardo la info en un estado  
→ Cuando cambia el estado, React re-renderiza la pantalla  
→ Así se actualiza TODO en tiempo real AUTOMÁTICAMENTE

=====================================================================
⭐ PASO 5 — CONDITIONAL RENDERING (MUY IMPORTANTE)
=====================================================================

El examen SIEMPRE te pide mostrar cosas dependiendo del estado.

Ejemplo típico:

return (
  <div>

    { Si NO estoy unido → mostrar botón }
    {!subasta && (
      <button onClick={unirse}>Unirme</button>
    )}

    { Si estoy unido → mostrar subasta }
    {subasta && (
      <div>
        <h2>Producto: {subasta.producto}</h2>
        <p>Precio actual: {subasta.precioActual}</p>
        <p>Mejor postor: {subasta.mejorPostor || "Nadie"}</p>
      </div>
    )}

    { Si hay error → mostrar mensaje }
    {mensajeError && <p style={{color:"red"}}>{mensajeError}</p>}
  </div>
);

Esto es EXACTAMENTE lo que te toman.

=====================================================================
⭐ PASO 6 — HISTORIAL (SI EL EXAMEN LO PIDE)
=====================================================================

Cuando llega una nueva oferta:

socket.on("nueva_oferta", (data) => {
  setHistorial(prev => [data, ...prev].slice(0, 5));
});

✔ Guarda las últimas 5 ofertas  
✔ Con el postor, precio y timestamp  

Para mostrarlo:

{historial.map((h, i) => (
  <p key={i}>
    {h.mejorPostor}: ${h.precioActual}
  </p>
))}

=====================================================================
⭐ PASO 7 — ENVIAR UNA OFERTA
=====================================================================

Si te piden emitir un evento:

socket.emit("realizar_oferta", {
  usuario: username,
  monto: nuevaOferta
});

✔ Siempre se hace desde una función  
✔ Siempre después de un click o acción del usuario  

=====================================================================
⭐ RESUMEN QUE TE TIENE QUE QUEDAR GRABADO EN EL CEREBRO 🔥
=====================================================================

✔ Socket = canal en tiempo real  
✔ Se crea dentro de useEffect:

   const s = io("http://IP:4000");

✔ Emito con:

   socket.emit("evento", { datos });

✔ Escucho con:

   socket.on("evento", callback);

✔ PERO SIEMPRE dentro de un useEffect  
✔ Y SIEMPRE con un socket.off en el return  
✔ Estados -> controlan la pantalla  
✔ Render condicional -> define qué mostrar

=====================================================================
🔥 FIN DEL COMENTARIO — ESTO SOLO TE HACE APROBAR 🔥
=====================================================================
*/
