"use client"

import clsx from "clsx";
import styles from "@/components/Mensaje.module.css"

export default function Mensaje(props){
    return (
        <>
            <div className={clsx(
                styles.mensaje,
                props.tipo == "enviado" ? styles.enviado : styles.recibido
            )}>
                <p className={styles.texto}>{props.texto}</p>
                <span className={styles.hora}>{props.hora}</span>
            </div>
        </>
    )
}