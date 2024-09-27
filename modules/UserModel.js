import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
  address: { type: String, required: true, unique: true },
  username: { type: String, required: false, default: "", unique: true },
  friends: [{ address: { type: String, required: true } }],
  preferences: {
    showOnSearch: { type: Boolean, default: false },
    allowDMs: { type: Boolean, default: true },
    receiveFiles: { type: Boolean, default: true },
  },
})

const User = mongoose.model("User", userSchema)

export default User
