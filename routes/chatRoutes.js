import express from "express"
import Chat from "../modules/ChatModel.js"
import { createHelia } from "helia"
import { unixfs } from "@helia/unixfs"
import axios from "axios"
import auth from "../middleware/auth.js"
const router = express.Router()
/******************************************** GET ALL CHATS *********************************************/

router.get("/", async (req, res) => {
  try {
    const chats = await Chat.find() // what this basically does is it finds all chats in the database using the Chat model exported from the ChatModel.js file
    res.status(200).json({ success: "Chats fetched successfully", chats })
  } catch (err) {
    res.status(500).json({ error: "Error getting chats" })
  }
})

/******************************************** GET CHAT LINKED *********************************************/

router.get("/:receiver", auth, async (req, res) => {
  try {
    const exist = await Chat.findOne(req.params, { message: 1, _id: 0 }) // projection to only get message and exclude _id
    if (!exist) {
      return res.status(400).json({ error: "message not found" })
    }
    if (!exist.message) {
      return res.status(404).end() // end the response as message is not present, 404 is sufficient
    }
    res.status(200).json(exist)
  } catch (err) {
    res.status(500).end()
  }
})

// ******************************************** SEND NEW CHAT ********************************************
// chat post will create a helia node w host l message biha then send multiaddress l nodePUT to update l node

router.post("/", auth, async (req, res) => {
  const { receiver, message, sender } = req.body
  if (!receiver || !message) {
    return res.status(400).json({ error: "Receiver, message are required" })
  }

  const helia = await createHelia(/*connect him with the receiver using GET */)
  try {
    const fs = unixfs(helia)
    const encoder = new TextEncoder()
    const cid = await fs.addBytes(encoder.encode(message))
    const chatData = { receiver, message: cid.toString() }
    const chat = await Chat.create(chatData)
    res.status(201).json({ success: "Chat created successfully", chat })
    //modify node
    const multiAddress = helia.libp2p.getMultiaddrs()

    let data = JSON.stringify({
      multiAddress: multiAddress[1].toString(),
    })
    let config = {
      method: "put",
      maxBodyLength: Infinity,
      url: `http://localhost:3002/api/nodes/${sender}`,
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    }

    axios
      .request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data))
      })
      .catch((error) => {
        console.log(error)
      })
    /*////////////////////////////// bellow is to check if other nodes can retreive the message /////////////////////////////// 
    
    console.log("the peers are: ", helia.libp2p.getPeers())
    const nodeA = await createHelia()
    const multiaddrs = helia.libp2p.getMultiaddrs()
    await nodeA.libp2p.dial(multiaddrs[1])
    console.log("multiaddrs are: ", multiaddrs)

    const fsA = unixfs(nodeA)
    const decoder = new TextDecoder()
    let text = ""
    setTimeout(async () => {
      for await (const chunk of fsA.cat(cid)) {
        text += decoder.decode(chunk, { stream: true })
      }
      console.log("Downloaded file contents in NodeA:", text)
    }, 5000)
    */
  } catch (err) {
    res.status(500).json({ error: "Error creating chat", err })
  }
})
export { router as chatRoutes }
