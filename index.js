const app = require("express")();
const server = require("http").createServer(app);
const cors = require("cors");

const io = require("socket.io")(server, {
	cors: {
		origin: "*",
		methods: [ "GET", "POST" ]
	}
});

app.use(cors());

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
	res.send('Running');
});

io.on("connection", (socket) => {
	socket.emit("me", socket.id);

	socket.on("disconnect", () => {
		socket.broadcast.emit("callEnded")
	});


	//3rd
	socket.on("callUser", ({ userToCall, signalData, from, name }) => {

		console.log("call user",{ userToCall, signalData, from, name })
		io.to(userToCall).emit("callUser", { signal: signalData, from, name });

	

	});



	//6th
	socket.on("answerCall", (data) => {

		console.log("answerCall",data)

		//7th
		io.to(data.to).emit("callAccepted", data.signal)
	});
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
