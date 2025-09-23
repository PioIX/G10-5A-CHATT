"use client"

import clsx from "clsx";
import styles from "@/components/Contact.module.css"

export default function Contact(props) {
    return (
        <>
            <div className={styles.contact}>
                <div className={styles.fotoPerfil}>
                    <img src={props.src} alt={props.contact} className={styles.imagen} />
                    <span 
                        className={clsx(
                            styles.indicador,
                            props.online ? styles.online : styles.offline
                        )}
                    ></span>
                </div>
                <div className={styles.info}>
                    <h2 className={styles.nombre}>{props.name}</h2>
                    {props.status && <p className={styles.status}>{props.status}</p>}
                    <p className={clsx(props.online ? styles.textoOnline : styles.textoOffline)}>
                        {props.online ? "En línea" : "Desconectado"}
                    </p>
                </div>
            </div>
        </>
    )
}