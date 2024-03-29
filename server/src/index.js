const app = require("express")();
const server = require("http").createServer(app);
const cors = require("cors");
const io = require("socket.io")(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
    res.send('Server is running and ready for WebRTC signaling.');
});

io.on("connection", (socket) => {
    // Emit the connected socket's ID
    socket.emit("me", socket.id);
    
    socket.on("sendCall", (data) => {                       
        io.to(data.to).emit("receiveCall", {
            signal: data.signal,
            from: socket.id
        });
        console.log('Offer sent from', socket.id, 'to', data.to);
    });

    socket.on("sendAnswer", (data) => {
        io.to(data.to).emit("receiveAnswer", {
            signal: data.signal,
            from: socket.id
        });
        console.log('Answer sent from', socket.id, 'to', data.to);
    });

    // socket.on("sendIceCandidate", (data) => {
    //     io.to(data.to).emit("receiveIceCandidate", {
    //         candidate: data.candidate,
    //         from: socket.id
    //     });
    //     console.log('ICE candidate sent from', socket.id, 'to', data.to);
    // });

    socket.on("disconnect", () => {
        socket.broadcast.emit("End Call ", { from: socket.id });
        console.log(socket.id, 'has disconnected');
    });
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
