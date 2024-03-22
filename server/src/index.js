const app = require("express")();
const server = require("http").createServer(app);
const cors = require("cors");
const { SocketAddress } = require("net");
const io = require("socket.io")(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
    res.send('Hello World');
});

io.on("connection", (socket) => {

    socket.emit("me", socket.id);

    socket.on("sendCall" , (data) => {                       
        socket.to(data.to).emit("sendCall" , {
            signal: data.signal,
            from: data.from
        });
        console.log(data);
    });

    socket.on("receivedCall" , (data) => {
        socket.to(data.to).emit('receivedCall' , {
            signal: data.signal,
            from: data.from
        });
    });

    // socket.on("handleIce", (data) => {               // ICE handling
    //     socket.to(data.to).emit("handleIce", {
    //         candidate: data.candidate,
    //         to: data.to
    //     });
    // });


    socket.on("disconnect" , () => {
        socket.broadcast.emit("End Call");
    })

});


server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
