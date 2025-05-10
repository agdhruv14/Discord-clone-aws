import express from "express"
import cors from "cors"
import { createServer } from "http"
import { Server } from "socket.io"
import { dbConnect, User, Message } from "./database.mjs"

dbConnect()

const app = express()
app.use(cors)
const server = createServer(app)

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173"
    }
})

io.on("connection", (socket)=>{
    console.log("user connected")
    console.log(io.engine.clientsCount)

    socket.on("userData", async (userId, email, userName)=>{
        console.log(userId)
        console.log(email)
        console.log(userName)

        const user = new User({
            userId: userId,
            email: email,
            username: userName,
            rooms: []
        })
        await user.save()
    })
    socket.on("userSignIn", async (userId) => {
        const user = await User.find({userId:userId}).exec()
        socket.emit("afterSignIn", user)
    })
    

    socket.on("roomConnect", async (roomName) => {
        const roomMessages = await Message.find({room: roomName}).exec()
        socket.join(roomName)
        console.log(roomMessages)
        socket.emit("oldRoomMessages", roomMessages)
    })

    socket.on("joinRoom", async ({ userId, roomName }) => {
        const users = await User.find({userId:userId}).exec();
        const user = users[0]
        console.log(user)
        if (!user.rooms.includes(roomName)) {
            user.rooms.push(roomName)
            await user.save()
        }
        const messages = await Message.find({ room: roomName }).exec()
        console.log(messages)
        socket.join(roomName)
        socket.emit("joinedRoom", { roomName, messages })
      
    })

    socket.on("sendMessage", async (messageData)=>{
        const message = new Message(messageData)
        await message.save()
        socket.to(messageData.room).emit("recieveMessage", messageData) 
    })


})

server.listen(3000, ()=>{
    console.log("server started")
})