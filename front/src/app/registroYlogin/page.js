"use client";

import { useState } from "react";
import Mensaje from "@/components/Mensaje";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Contact from "@/components/Contact";
import styles from "./page.module.css";

export default function Login (){
    const [numero_telefono, setNumeroTelefono] = useState(0)
    const [password, setPassword] = useState("")
    const [modal, setModal] = useState({open: false, title: "", message: ""});
    const router = useRouter()

    const showModal = (title, message) => {
        setModal({open: true, title, message})
    }
    const closeModal = () => {
        setModal({...modal, open: false});
    }

    async function ingresar(){
        const datosLogin = {
            numero_telefono : numero_telefono,
            password:password
        };
        try {
            const response = await fetch("http://localhost:4001/LoginUsuarios",{
                method: "POST",
                headers: {
                    "Content-Type" : "application/json",

                },
                body : JSON.stringify(datosLogin),
            });
            const result = await response.json();
            console.log(result)
            if (result.res === true){
                showModal("Éxito", "¡Has iniciado sesión correctamente!");
                router.push("/dashboard");
            } else {
                showModal("Error", result.message || "Credenciales incorrectas");
            }
        } catch (error) {
            console.error(error);
            showModal("Error", "Hubo un problema con la conexión al servidor.");
        }
        
    }

}