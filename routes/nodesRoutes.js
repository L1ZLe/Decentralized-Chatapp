import express from "express"
import Node from "../modules/NodeModel.js"
import { createHelia } from "helia"
import auth from "../middleware/auth.js"

const router = express.Router()
/******************************************** GET ALL NODES *********************************************/

router.get("/", async (req, res) => {
  try {
    const nodes = await Node.find()
    res.status(200).json({ success: "Nodes fetched successfully", nodes })
  } catch (err) {
    res.status(500).json({ error: "Error getting nodes" })
  }
})

/******************************************** GET NODE LINKED *********************************************/

router.get("/:address", auth, async (req, res) => {
  try {
    const exist = await Node.findOne(req.params, { nodeId: 1, _id: 0 }) // projection to only get nodeId and exclude _id
    if (!exist) {
      return res.status(400).json({ error: "Invalid address" })
    }
    if (!exist.nodeId) {
      return res.status(404).end() // end the response as nodeId is not present, 404 is sufficient
    }
    res.status(200).json(exist)
  } catch (err) {
    res.status(500).end()
  }
})

// ********************************************  CREATE NEW ADDRESSES/NODES ********************************************
router.post("/:address", auth, async (req, res) => {
  const { address } = req.params
  if (!address) {
    return res.status(400).json({ error: "Address is required" })
  }
  const exist = await Node.findOne({ address })
  if (exist) {
    return res.status(400).json({ error: "Address already exist" })
  }
  try {
    const node = await Node.create({ address })
    res.status(201).json({ success: "Node created successfully", node })
  } catch (err) {
    return res.status(400).json({ error: `Node validation failed: ${err}` })
  }
})

//*************************************UPDATE NODES****************************************
// THIS ONE FOR CHANGING THE NODE 2 times (when we send a message and when we get a message)

router.put("/:address", auth, async (req, res) => {
  const node = await Node.findOne({ address: req.params.address })
  const helia = await createHelia()
  const multiAddress = helia.libp2p.getMultiaddrs()
  try {
    node.nodeId = multiAddress[1].toString()
    await node.save() // what this basically does is it saves the node in the database
    res.status(200).json({ success: "Node updated successfully", node })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Error updating node" + err })
  }
})
/*this one IS FOR CHANGING THE NODE EVERYTIME WE SEND A MESSAGE 
router.put("/:address", async (req, res) => {
  const node = await Node.findOne({ address: req.params.address })
  const { multiAddress } = req.body
  try {
    node.nodeId = multiAddress
    await node.save() // what this basically does is it saves the node in the database
    res.status(200).json({ success: "Node updated successfully", node })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Error updating node" + err })
  }
})*/

export { router as nodesRoutes }
