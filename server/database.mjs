import dotenv from "dotenv"
import mongoose from "mongoose"

dotenv.config()


export const dbConnect = async () => {
    await mongoose.connect(process.env.MONGOOSE_CONNECTION)
}

const messageSchema = new mongoose.Schema({
    author: String,
    message: String,
    room: String,
    time: String
})

const userSchema = new mongoose.Schema({
    userId: String,
    username: String,
    email: String,
    rooms : Array    
})

export const User = mongoose.model("User", userSchema)
export const Message = mongoose.model("Message", messageSchema)


