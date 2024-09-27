import mongoose from "mongoose"

const nodeSchema = new mongoose.Schema({
  address: {
    type: mongoose.Schema.Types.String,
    required: true,
    ref: "User",
    unique: true,
  },
  nodeId: { type: String, default: "" },
})

const Node = mongoose.model("Node", nodeSchema)
export default Node
