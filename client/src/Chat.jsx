import { getCurrentUser, signOut } from "aws-amplify/auth"
import { useState, useEffect } from "react"
import { io } from "socket.io-client"

const socket = io("http://localhost:3000")

export default function Chat({ setPage, userEmail }) {
    const [userId, setUserId] = useState("")
    const [userName, setUserName] = useState("")
    const [rooms, setRooms] = useState([])
    const [selectedRoom, setSelectedRoom] = useState("")
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState("")
    const [newRoomName, setNewRoomName] = useState("")

    socket.on("recieveMessage", (msg) => {
        setMessages((prev) => [...prev, msg])
    })

    useEffect(() => {
        async function fetchData() {
            try {
                const { userId } = await getCurrentUser()
                setUserId(userId)
                socket.emit("userSignIn", userId)

                socket.on("afterSignIn", (data) => {
                    setUserName(data[0].username)
                    setRooms(data[0].rooms)
                })

                socket.on("oldRoomMessages", (msgs) => {
                    console.log(msgs)
                    setMessages(msgs)
                })

                socket.on("joinedRoom", ({ roomName, messages }) => {
                    setSelectedRoom(roomName)
                    setRooms((prev) => prev.includes(roomName) ? prev : [...prev, roomName])
                    setMessages(messages)
                })
            } catch (err) {
                console.error("User not found", err)
                setPage("signUp")
            }
        }
        fetchData()

        return () => {
            socket.off("afterSignIn")
            socket.off("oldRoomMessages")
            socket.off("joinedRoom")
            socket.off("recieveMessage")
        }
    }, [selectedRoom])

    const handleRoomClick = (room) => {
        setSelectedRoom(room)
        socket.emit("roomConnect", room)
    }

    const handleJoinRoom = (e) => {
        e.preventDefault()
        if (!newRoomName.trim()) return
        socket.emit("joinRoom", { userId, roomName: newRoomName.trim() })
        setNewRoomName("")
    }

    const sendMessage = (e) => {
        e.preventDefault()
        if (!newMessage.trim() || !selectedRoom) return

        const messageData = {
            author: userName,
            room: selectedRoom,
            message: newMessage,
            time: `${String(new Date().getHours()).padStart(2, "0")}:${String(new Date().getMinutes()).padStart(2, "0")}`
        }

        socket.emit("sendMessage", messageData)
        setMessages((prev) => [...prev, messageData])
        setNewMessage("")
    }

    async function signUserOut() {
        try {
            await getCurrentUser()
            await signOut()
            console.log("Signed out successfully")
        } catch (error) {
            console.log("No user was signed in:", error)
        }
        setPage("signUp")
    }

    return (
        <div style={{ display: "flex", height: "100vh", fontFamily: "Arial, sans-serif" }}>
            {/* Sidebar */}
            <div style={{ width: "30%", padding: "1rem", borderRight: "1px solid #ccc" }}>
                <h2>{userName}</h2>
                <h3>Your Rooms</h3>
                {rooms.map((room, idx) => (
                    <div key={idx} 
                         style={{ padding: "0.5rem", cursor: "pointer"}} 
                         onClick={() => handleRoomClick(room)}>
                        {room}
                    </div>
                ))}
                <form onSubmit={handleJoinRoom} style={{ marginTop: "1rem" }}>
                    <input 
                        value={newRoomName} 
                        onChange={(e) => setNewRoomName(e.target.value)} 
                        placeholder="Join new room..." 
                        style={{ width: "100%", marginBottom: "0.5rem" }}
                    />
                    <button type="submit" style={{ width: "100%" }}>Join Room</button>
                </form>
                <button onClick={signUserOut} style={{ marginTop: "1rem", backgroundColor: "#f66", color: "white", width: "100%" }}>
                    Sign Out
                </button>
            </div>

            {/* Chat Area */}
            <div style={{ width: "70%", padding: "1rem" }}>
                <h2>{selectedRoom ? `Room: ${selectedRoom}` : "Select a Room"}</h2>
                <div style={{ border: "1px solid #ccc", height: "70vh", overflowY: "scroll", padding: "0.5rem", marginBottom: "1rem" }}>
                {messages.map((msg, idx) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                        <p style={{ margin: 0 }}>
                            <strong>{msg.author}</strong>: {msg.message}
                        </p>
                        <span style={{ fontSize: "0.85em", color: "gray", marginLeft: "1rem" }}>{msg.time}</span>
                    </div>
                ))}
                </div>
                {selectedRoom && (
                    <form onSubmit={sendMessage} style={{ display: "flex", gap: "0.5rem" }}>
                        <input 
                            value={newMessage} 
                            onChange={(e) => setNewMessage(e.target.value)} 
                            placeholder="Type your message..." 
                            style={{ flex: 1 }}
                        />
                        <button type="submit">Send</button>
                    </form>
                )}
            </div>
        </div>
    )
}
