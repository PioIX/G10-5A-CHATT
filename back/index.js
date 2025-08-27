
//ES EL INDEX DEL PROYECTO ANTERIOR PERO LO VOY A USAR DE BASE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

var express = require('express'); //Tipo de servidor: Express
var bodyParser = require('body-parser'); //Convierte los JSON
var cors = require('cors');
const { realizarQuery } = require('./modulos/mysql');

var app = express(); //Inicializo express
var port = process.env.PORT || 4000; //Ejecuto el servidor en el puerto 3000

// Convierte una petición recibida (POST-GET...) a objeto JSON
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(cors());



app.get('/', function(req, res){
    res.status(200).send({
        message: 'GET Home route working fine!'
    });
});

//get usuarios
app.get('/Usuarios', async function(req, res){
   try {
     let respuesta;
     if (req.query.numero_telefono != undefined) {
         respuesta = await realizarQuery(`SELECT * FROM Usuarios WHERE numero_telefono=${req.query.numero_telefono}`)
     } else {
         respuesta = await realizarQuery("SELECT * FROM Usuarios");
     }
     res.status(200).send({
         message: 'Aca estan los usuarios',
         usuarios: respuesta
    });
   } catch (e) {
        console.log(e);
        res.send("Hubo un error, " + e)
        
   }
});


//get chats
app.get('/Chats', async function(req, res){
   try {
     let respuesta;
     if (req.query.id_chat != undefined) {
         respuesta = await realizarQuery(`SELECT * FROM Chats WHERE id_chat=${req.query.id_chat}`)
     } else {
         respuesta = await realizarQuery("SELECT * FROM Chats");
     }
     res.status(200).send({
         message: 'Aca estan los chats',
         chats: respuesta
    });
   } catch (e) {
        console.log(e);
        res.send("Hubo un error, " + e)
        
   }
});



//get mensajes
app.get('/Mensajes', async function(req, res){
   try {
     let respuesta;
     if (req.query.id_mensaje != undefined) {
         respuesta = await realizarQuery(`SELECT * FROM Mensajes WHERE id_mensaje=${req.query.id_mensaje}`)
     } else {
         respuesta = await realizarQuery("SELECT * FROM Mensajes");
     }
     res.status(200).send({
         message: 'Aca estan los mensajes',
         mensajes: respuesta
    });
   } catch (e) {
        console.log(e);
        res.send("Hubo un error, " + e)
        
   }
});


//get user_chat
app.get('/User_chat', async function(req, res){
   try {
     let respuesta;
     if (req.query.id_userchat != undefined) {
         respuesta = await realizarQuery(`SELECT * FROM User_chat WHERE id_userchat=${req.query.id_userchat}`)
     } else {
         respuesta = await realizarQuery("SELECT * FROM User_chat");
     }
     res.status(200).send({
         message: 'Aca estan los userChat',
         user_chat: respuesta
    });
   } catch (e) {
        console.log(e);
        res.send("Hubo un error, " + e)
        
   }
});

//delete usuarios
app.delete('/BorrarUsuarios', async function (req, res) {
    let numero_telefono = req.body.numero_telefono;

    if (!numero_telefono) {
        return res.send({ res: "Falta ingresar un numero de telefono", borrada: false });
    }

    try {
        let respuesta = await realizarQuery(`SELECT * FROM Usuarios WHERE numero_telefono="${req.body.numero_telefono}"`);

        if (respuesta.length > 0) {
            await realizarQuery(`DELETE FROM Usuarios WHERE numero_telefono="${req.body.numero_telefono}"`);
            res.send({ res: "Usuario eliminado", borrada: true });
        } else {
            res.send({ res: "El usuario no existe", borrada: false });
        }
    } catch (error) {
        console.error("Error al borrar usuario:", error);
        res.status(500).send({ res: "Error interno", borrada: false });
    }
});

//delete chats
app.delete('/BorrarChat', async function (req, res) {
    let id_chat = req.body.id_chat;

    if (!id_chat) {
        return res.send({ res: "Falta ingresar un id de chat", borrada: false });
    }

    try {
        let respuesta = await realizarQuery(`SELECT * FROM Chats WHERE id_chat="${req.body.id_chat}"`);

        if (respuesta.length > 0) {
            await realizarQuery(`DELETE FROM Chats WHERE id_chat="${req.body.id_chat}"`);
            res.send({ res: "Chat eliminado", borrada: true });
        } else {
            res.send({ res: "El chat no existe", borrada: false });
        }
    } catch (error) {
        console.error("Error al borrar chat:", error);
        res.status(500).send({ res: "Error interno", borrada: false });
    }
});

//delete mensaje
app.delete('/BorrarMensaje', async function (req, res) {
    let id_mensaje = req.body.id_mensaje;

    if (!id_mensaje) {
        return res.send({ res: "Falta ingresar un id de mensaje", borrada: false });
    }

    try {
        let respuesta = await realizarQuery(`SELECT * FROM Mensajes WHERE id_mensaje="${req.body.id_mensaje}"`);

        if (respuesta.length > 0) {
            await realizarQuery(`DELETE FROM Mensajes WHERE id_mensajes="${req.body.id_mensaje}"`);
            res.send({ res: "Mensajes eliminado", borrada: true });
        } else {
            res.send({ res: "El mensaje no existe", borrada: false });
        }
    } catch (error) {
        console.error("Error al borrar mensaje:", error);
        res.status(500).send({ res: "Error interno", borrada: false });
    }
});



//get palabras aleatorias
app.get('/PalabrasAleatorias', async function(req, res){
   try {
     let respuesta;
     if (req.query.id_chat != undefined) {
         respuesta =  await realizarQuery(`SELECT palabra FROM Palabras ORDER BY RAND() LIMIT 1`);
     } else {
         respuesta = await realizarQuery(`SELECT palabra FROM Palabras ORDER BY RAND() LIMIT 1`);
     } 
     if (respuesta.length > 0) {
         res.send({ palabra: respuesta[0].palabra })
    }
    else{
         res.send({ res: "Palabra no encontrada" })
    }
   } catch (e) {
        console.log(e);
        res.send("Hubo un error, " + e)
        
   }
});


//para ver si es admin
app.get('/Administrador', async function(req, res){
   try {
     let respuesta;
     if (req.query.administrador != undefined) {
         respuesta = await realizarQuery(`SELECT * FROM Jugadores WHERE administrador=${req.query.administrador}`)
     } else {
         respuesta = await realizarQuery("SELECT * FROM Jugadores");
     }
    
     res.status(200).send({
         message: 'Usted es administrador',
         jugadores: respuesta
         
    });
   } catch (e) {
        console.log(e);
        res.send("Hubo un error, " + e)
        
   }
});


//get ranking 
app.get('/Ranking', async function (req, res) {
    try {
        let respuesta = await realizarQuery(`
            SELECT nombre_usuario, puntos, partidas_jugadas, partidas_ganadas, partidas_perdidas 
            FROM Jugadores
            ORDER BY puntos DESC
            LIMIT 10
        `);
        res.json({ ranking: respuesta });
    } catch (e) {
        console.log("Error al obtener el ranking:", e);
        res.status(500).send("Hubo un error: " + e);
    }
});




//post palabras(admin) 
app.post('/AgregarPalabras', async function(req,res) {
    console.log(req.body) 
    let respuesta;
    if (req.body.palabra != undefined) {
        respuesta = await realizarQuery(`SELECT * FROM Palabras WHERE palabra='${req.body.palabra}'`)
        console.log(respuesta)
        if (respuesta.length != 0) 
            console.log("Esa palabra ya existe")
        else{
           await realizarQuery(`
            INSERT INTO Palabras (palabra) VALUES
            ("${req.body.palabra}");
        `)
        res.send({res: "Palabra agregada", agregado: true})
    }
    } else {
        res.send({res: "Falta palabra", agregado:false})

    }    

})


//get tabla jugadores
app.get('/Jugadores', async function(req, res){
   try {
     let respuesta;
     if (req.query.jugador != undefined ) {
         respuesta = await realizarQuery(`SELECT * FROM Jugadores WHERE jugadores=${req.query.jugadores}`)
     } else {
         respuesta = await realizarQuery("SELECT * FROM Jugadores");
     }
     res.status(200).send({
         message: 'Aca estan los jugadores',
         jugadores: respuesta
    });
   } catch (e) {
        console.log(e);
        res.send("Hubo un error, " + e)
        
   }
});

//post jugadores: Se puede usar para nel registrar, no para el login
app.post('/Registro', async function(req,res) {
    console.log("/registro req.body:"+req.body) 
    let respuesta;
    if (req.body.nombre_usuario != undefined) {
        respuesta = await realizarQuery(`SELECT * FROM Jugadores WHERE nombre_usuario="${req.body.nombre_usuario}"`)
        console.log(respuesta)
        if (respuesta.length != 0) {
            res.send({res: "Ese nombre de usuario ya existe", registro:false})}
        else{
           await realizarQuery(`
            INSERT INTO Jugadores (nombre_usuario,contraseña) VALUES
            ('${req.body.nombre_usuario}','${req.body.contraseña}')`)
        res.send({res: "Jugador agregado", registro: true})
    }
    } else {
        res.send({res: "Falta nombre de usuario", registro:false})

    }    

})

//login
app.post('/Login', async function(req,res) {
    console.log(req.body) 
    let respuesta;
    if (req.body.nombre_usuario != undefined) {
        respuesta = await realizarQuery(`SELECT * FROM Jugadores WHERE nombre_usuario="${req.body.nombre_usuario}"`)
        console.log(respuesta)
        if (respuesta.length > 0) {
            if (req.body.contraseña != undefined) {
                respuesta = await realizarQuery(`SELECT * FROM Jugadores WHERE nombre_usuario="${req.body.nombre_usuario}" && contraseña="${req.body.contraseña}"`)
                if  (respuesta.length > 0) {
                    console.log(respuesta)
                    res.send({
                        res: "Jugador existe",
                        loguea: true,
                        admin: Boolean(respuesta[0].administrador)
})
                }
                else{
                    res.send({res:"Contraseña incorrecta",loguea:false}) 
                }
            }else{
                res.send({res:"Falta ingresar contraseña",loguea:false})                
            }
        } 
        else{
            res.send({res:"Esta mal el nombre de usuario",loguea:false})
        }
    
    }else {
        res.send({res:"Falta nombre de usuario",loguea:false})

    }    

})


//funcion para ranking
app.put('/ActualizarEstadisticas', async function (req, res) {
    const { nombre_usuario, resultado, puntos } = req.body;
    console.log("Me llego: ")
    console.log(req.body)
    if (!nombre_usuario || !resultado) {
        return res.status(400).send({ res: "Faltan datos" });
    }
    try {
        let query = ""
        if (resultado == "ganada") {
            let datos = await realizarQuery(`SELECT partidas_ganadas, partidas_jugadas, puntos FROM Jugadores WHERE nombre_usuario = "${nombre_usuario}"`)
            let {partidas_ganadas , partidas_jugadas } = datos[0]
            console.log({partidas_ganadas , partidas_jugadas})
            query = `UPDATE Jugadores SET partidas_jugadas = ${partidas_jugadas + 1}, partidas_ganadas = ${partidas_ganadas + 1}, puntos = ${puntos + datos[0].puntos} WHERE nombre_usuario = "${nombre_usuario}"`;
        } else {
            let datos = await realizarQuery(`SELECT partidas_perdidas, partidas_jugadas, puntos FROM Jugadores WHERE nombre_usuario = "${nombre_usuario}"`)
            let {partidas_jugadas , partidas_perdidas } = datos[0]
            console.log({partidas_jugadas , partidas_perdidas})
            query = `UPDATE Jugadores SET partidas_jugadas = ${partidas_jugadas + 1}, partidas_perdidas = ${partidas_perdidas + 1}, puntos = ${puntos + datos[0].puntos} WHERE nombre_usuario = "${nombre_usuario}"`;
        }
        
        await realizarQuery(query);
        res.send({ res: "Estadísticas actualizadas correctamente" });
    } catch (e) {
        console.error("Error al actualizar estadísticas:", e);
        res.status(500).send({ res: "Error interno" });
    }
});



app.delete('/BorrarPalabra', async function (req, res) {
    let palabra = req.body.palabra;

    if (!palabra) {
        return res.send({ res: "Falta ingresar una palabra", borrada: false });
    }

    try {
        let respuesta = await realizarQuery(`SELECT * FROM Palabras WHERE palabra="${req.body.palabra}"`);

        if (respuesta.length > 0) {
            await realizarQuery(`DELETE FROM Palabras WHERE palabra ="${req.body.palabra}"`);
            res.send({ res: "Palabra eliminada", borrada: true });
        } else {
            res.send({ res: "La palabra no existe", borrada: false });
        }
    } catch (error) {
        console.error("Error al borrar palabra:", error);
        res.status(500).send({ res: "Error interno", borrada: false });
    }
});



app.delete('/BorrarJugador', async function (req, res) {
    let nombre_usuario = req.body.nombre_usuario;

    if (!nombre_usuario) {
        return res.send({ res: "Falta ingresar un jugador", borrada: false });
    }

    try {
        let respuesta = await realizarQuery(`SELECT * FROM Jugadores WHERE nombre_usuario="${req.body.nombre_usuario}"`);

        if (respuesta.length > 0) {
            await realizarQuery(`DELETE FROM Jugadores WHERE nombre_usuario="${req.body.nombre_usuario}"`);
            res.send({ res: "Jugador eliminado", borrada: true });
        } else {
            res.send({ res: "El jugador no existe", borrada: false });
        }
    } catch (error) {
        console.error("Error al borrar jugador:", error);
        res.status(500).send({ res: "Error interno", borrada: false });
    }
});



//Pongo el servidor a escuchar
app.listen(port, function(){
    console.log(`Server running in http://localhost:${port}`);
});