
//ES EL INDEX DEL PROYECTO ANTERIOR PERO LO VOY A USAR DE BASE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
const session = require('express-session');	
var express = require('express'); //Tipo de servidor: Express
var bodyParser = require('body-parser'); //Convierte los JSON
var cors = require('cors');
const { realizarQuery } = require('./modulos/mysql');

var app = express(); //Inicializo express
var port = process.env.PORT || 4001; //Ejecuto el servidor en el puerto 3000

// Convierte una petición recibida (POST-GET...) a objeto JSON
app.use(express.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(cors());



app.get('/', function(req, res){
    res.status(200).send({
        message: 'GET Home route working fine!'
    });
});




const server = app.listen(port, () => {
	console.log(`Servidor NodeJS corriendo en http://localhost:${port}/`);
});;

const io = require('socket.io')(server, {
	cors: {
		// IMPORTANTE: REVISAR PUERTO DEL FRONTEND
		origin: ["http://localhost:3000", "http://localhost:3001"], // Permitir el origen localhost:3000
		methods: ["GET", "POST", "PUT", "DELETE"],  	// Métodos permitidos
		credentials: true                           	// Habilitar el envío de cookies
	}
});

const sessionMiddleware = session({
	//Elegir tu propia key secreta
	secret: "supersarasa",
	resave: false,
	saveUninitialized: false
});

app.use(sessionMiddleware);

io.use((socket, next) => {
	sessionMiddleware(socket.request, {}, next);
});

/*
	A PARTIR DE ACÁ LOS EVENTOS DEL SOCKET
	A PARTIR DE ACÁ LOS EVENTOS DEL SOCKET
	A PARTIR DE ACÁ LOS EVENTOS DEL SOCKET
*/

io.on("connection", (socket) => {
	const req = socket.request;

	socket.on('joinRoom', data => {
		console.log("🚀 ~ io.on ~ req.session.room:", req.session.room)
		if (req.session.room != undefined && req.session.room.length > 0)
			socket.leave(req.session.room);
		req.session.room = data.room;
		socket.join(req.session.room);

		io.to(req.session.room).emit('chat-messages', { user: req.session.user, room: req.session.room });
	});

	socket.on('pingAll', data => {
		console.log("PING ALL: ", data);
		io.emit('pingAll', { event: "Ping to all", message: data });
	});

	socket.on('sendMessage', data => {
		io.to(req.session.room).emit('newMessage', { room: req.session.room, message: data });
	});

	socket.on('disconnect', () => {
		console.log("Disconnect");
	})
});






//get usuarios
app.get('/Usuarios', async function(req, res){
   try {
     let respuesta;
     if (req.query.num_telefono != undefined) {
         respuesta = await realizarQuery(`SELECT * FROM Usuarios WHERE num_telefono="${req.query.num_telefono}"`)
     } else {
         respuesta = await realizarQuery("SELECT * FROM Usuarios");
     }
     res.status(200).json({
         message: 'Aca estan los usuarios',
         usuarios: respuesta
    });
   } catch (e) {
        console.log(e);
        res.json("Hubo un error, " + e)
        
   }
});

//get mensajes del chat

app.get('/MensajesChat', async function(req, res) {
    const { id_chat, id_usuario } = req.query;
    if (!id_chat || !id_usuario) {
        return res.status(400).json({ error: "Faltan parámetros" });
    }
    console.log("id_chat:", id_chat, "id_usuario:", id_usuario);
    try {
        //Me traigo los id_chats donde este uno u otro usuario 
        /*
        let respuesta = await realizarQuery(`SELECT * FROM UsuariosPorChat WHERE id_usuario = ${idLogged} OR id_usuario = ${id_usuario}`);
        if (respuesta.length === 0) {
            return res.status(404).json({ error: "No se encontraron chats para los usuarios proporcionados" });
        }
        // Verifica que el usuario esté en el chat
        console.log("respuesta:", respuesta);
        let id_chat_logged = [];
        let id_chat = -1;
        for (let i = 0; i < respuesta.length; i++) {
            const element = respuesta[i];
            if (element.id_usuario == idLogged) {
                id_chat_logged.push(element.id_chat);
            }
        }
        for (let i = 0; i < respuesta.length; i++) {
            const element = respuesta[i];
            for (let l = 0; l < id_chat_logged.length; l++) {
                if (element.id_chat == id_chat_logged[l]) {
                    id_chat = element.id_chat;
                }     
            }
            
        }
        */
        if (id_chat === -1) {
            return res.status(403).json({ error: "El usuario no pertenece a este chat" });
        }
        console.log("id_chat encontrado:", id_chat);
        // Trae los mensajes del chat
        const mensajes = await realizarQuery(`
            SELECT Mensajes.id_mensaje, Mensajes.mensaje, Mensajes.hora_de_envio, Usuarios.nombre, Chats.id_chat FROM Mensajes INNER JOIN Chats ON Mensajes.id_chat = Chats.id_chat 
            INNER JOIN UsuariosPorChat ON Chats.id_chat = UsuariosPorChat.id_chat INNER JOIN Usuarios ON UsuariosPorChat.id_usuario = Usuarios.id_usuario
            WHERE Mensajes.id_chat = "${id_chat}" ORDER BY Mensajes.hora_de_envio ASC
        `);
        res.send({ mensajes: mensajes });
    } catch (error) {
        console.error("Error en /MensajesChat:", error);
        res.status(500).json({ error: "Error interno al obtener mensajes" });
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

//PEDIR AYUDA A RIVAS PARA HACER EL PEDIDO
app.get('/MensajesChats', async function (req,res){
    console.log(req.query)
    const mensajes = await realizarQuery(` SELECT DISTINCT id_chat FROM UsuariosPorChat WHERE id_usuario =  ${req.body.idLogged};`)
    let contactos = []
    for (let i = 0; i < chats.length; i++) {
        const auxiliar = await realizarQuery(` SELECT DISTINCT Usuarios.nombre, Usuarios.id_usuario, Chats.es_grupo, Chats.nombre_grupo FROM Usuarios
        INNER JOIN UsuariosPorChat ON Usuarios.id_usuario = UsuariosPorChat.id_usuario
        INNER JOIN Chats ON Chats.id_chat = UsuariosPorChat.id_chat
         WHERE UsuariosPorChat.id_chat = ${chats[i].id_chat};`)
        contactos.push(auxiliar)
    }
    console.log(contactos)
    if(chats.length > 0){
        res.send({contactos})
    }else{
        res.send({res: "no tiene contactos"})
    }
     
})




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
    let num_telefono = req.body.num_telefono;

    if (!num_telefono) {
        return res.json({ res: "Falta ingresar un numero de telefono", borrada: false });
    }

    try {
        let respuesta = await realizarQuery(`SELECT * FROM Usuarios WHERE num_telefono="${req.body.num_telefono}"`);

        if (respuesta.length > 0) {
            await realizarQuery(`DELETE FROM Usuarios WHERE num_telefono="${req.body.num_telefono}"`);
            res.json({ res: "Usuario eliminado", borrada: true });
        } else {
            res.json({ res: "El usuario no existe", borrada: false });
        }
    } catch (error) {
        console.error("Error al borrar usuario:", error);
        res.status(500).json({ res: "Error interno", borrada: false });
    }
});

//delete chats
app.delete('/BorrarChat', async function (req, res) {
    let id_chat = req.body.id_chat;

    if (!id_chat) {
        return res.json({ res: "Falta ingresar un id de chat", borrada: false });
    }

    try {
        let respuesta = await realizarQuery(`SELECT * FROM Chats WHERE id_chat="${req.body.id_chat}"`);

        if (respuesta.length > 0) {
            await realizarQuery(`DELETE FROM Chats WHERE id_chat="${req.body.id_chat}"`);
            res.json({ res: "Chat eliminado", borrada: true });
        } else {
            res.json({ res: "El chat no existe", borrada: false });
        }
    } catch (error) {
        console.error("Error al borrar chat:", error);
        res.status(500).json({ res: "Error interno", borrada: false });
    }
});

//delete mensaje
app.delete('/BorrarMensaje', async function (req, res) {
    let id_mensaje = req.body.id_mensaje;

    if (!id_mensaje) {
        return res.json({ res: "Falta ingresar un id de mensaje", borrada: false });
    }

    try {
        let respuesta = await realizarQuery(`SELECT * FROM Mensajes WHERE id_mensaje=${req.body.id_mensaje}`);

        if (respuesta.length > 0) {
            await realizarQuery(`DELETE FROM Mensajes WHERE id_mensaje=${req.body.id_mensaje}`);
            res.json({ res: "Mensajes eliminado", borrada: true });
        } else {
            res.json({ res: "El mensaje no existe", borrada: false });
        }
    } catch (error) {
        console.error("Error al borrar mensaje:", error);
        res.status(500).json({ res: "Error interno", borrada: false });
    }
});

app.post('/RegistroUsuarios', async function(req, res) {
  console.log("/RegistroUsuarios req.body:", req.body);
  try {
    const { foto_perfil, num_telefono, contraseña, nombre, mail } = req.body;

    if (!num_telefono) {
      return res.json({ res: "Falta numero de telefono", registro: false });
    }

    let respuesta = await realizarQuery(`SELECT * FROM Usuarios WHERE num_telefono="${num_telefono}"`);

    if (respuesta.length !== 0) {
      return res.json({ res: "Ese numero de telefono ya existe", registro: false });
    }

    let usuarios = await realizarQuery(`SELECT id_usuario FROM Usuarios `);
    let id = -1
    for (let i = 0; i < usuarios.length; i++) {
        if(id < usuarios[i].id_usuario){
            id = usuarios[i].id_usuario
        }
        
    }
    id++;
    await realizarQuery(`
      INSERT INTO Usuarios (id_usuario, foto_perfil, num_telefono, contraseña, nombre, mail)
      VALUES (${id},"${foto_perfil}","${num_telefono}", "${contraseña}", "${nombre}", "${mail}")
    `);

    res.json({ res: "Usuario agregado", registro: true, idLogged: id });
  } catch (e) {
    console.error("Error en /RegistroUsuarios:", e);
    res.status(500).json({ res: "Error interno", registro: false });
  }
});


//login numeros
app.post('/LoginUsuarios', async function(req,res) {
    console.log(req.body) 
    let respuesta;
    if (req.body.num_telefono != undefined) {
        respuesta = await realizarQuery(`SELECT * FROM Usuarios WHERE num_telefono="${req.body.num_telefono}"`)
        console.log(respuesta)
        if (respuesta.length > 0) {
            if (req.body.contraseña != undefined) {
                respuesta = await realizarQuery(`SELECT * FROM Usuarios WHERE num_telefono="${req.body.num_telefono}" && contraseña="${req.body.contraseña}"`)
                console.log(respuesta)
                if  (respuesta.length > 0) {
                    res.json({
                        res: "Usuario existe",
                        loguea: true,
                        idLogged: respuesta[0].id_usuario
                        //admin: Boolean(respuesta[0].administrador)
})
                }
                else{
                    res.json({res:"Contraseña incorrecta",loguea:false}) 
                }
            }else{
                res.json({res:"Falta ingresar contraseña",loguea:false})                
            }
        } 
        else{
            res.json({res:"Esta mal el numero de telefono",loguea:false})
        }
    
    }else {
        res.json({res:"Falta numero de telefono",loguea:false})

    }    

})

//post para obtener los chats de un usuario
app.post('/Chats', async function (req,res){
    console.log(req.body)
    const chats = await realizarQuery(` SELECT DISTINCT id_chat FROM UsuariosPorChat WHERE id_usuario =  ${req.body.idLogged};`)
    let contactos = []
    for (let i = 0; i < chats.length; i++) {
        const auxiliar = await realizarQuery(` SELECT DISTINCT Usuarios.nombre, Usuarios.id_usuario, Chats.es_grupo, Chats.nombre_grupo, Chats.id_chat FROM Usuarios
        INNER JOIN UsuariosPorChat ON Usuarios.id_usuario = UsuariosPorChat.id_usuario
        INNER JOIN Chats ON Chats.id_chat = UsuariosPorChat.id_chat
         WHERE UsuariosPorChat.id_chat = ${chats[i].id_chat};`)
        contactos.push(auxiliar)
    }
    console.log(contactos)
    if(chats.length > 0){
        res.send({contactos})
    }else{
        res.send({res: "no tiene contactos"})
    }
     
})









