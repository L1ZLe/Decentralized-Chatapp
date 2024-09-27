import mongoose from "mongoose"

const chatSchema = new mongoose.Schema({
  receiver: {
    type: mongoose.Schema.Types.String,
    ref: "Node",
    required: true,
  },
  message: { type: String, required: true },
})

const Chat = mongoose.model("Chat", chatSchema)

export default Chat
