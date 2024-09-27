import express from "express"
import User from "../modules/UserModel.js"
import mongoose from "mongoose"
import auth from "../middleware/auth.js"

const router = express.Router() // what this basically does is it creates a new router which we can use to handle requests. app vs router: app is the main application, router is the router that we can use to handle requests
/******************************************** GET ALL USERS *********************************************/
router.get("/", async (req, res) => {
  try {
    const users = await User.find() // what this basically does is it finds all users in the database using the User model exported from the UserModel.js file
    //ConnectToNode(user.node) // what this does is it connects to the user's node
    res.status(200).json({ success: "Users fetched successfully", users })
  } catch (err) {
    res.status(500).json({ error: "Error getting users" })
  }
})

/********************************************  CREATE NEW USERS *********************************************/
router.post("/", auth, async (req, res) => {
  const { address, username, friends } = req.body
  if (!address) {
    //check if address and body are not empty
    return res.status(400).json({ error: "Address is required" })
  }

  const usernameExist = await User.findOne({ username })
  if (usernameExist) {
    return res.status(400).json({ error: "Username already exist" })
  }

  try {
    const user = await User.create({ address, username, friends }) // what this basically does is it creates a new user in the database using the User model exported from the UserModel.js file
    res.status(201).json({ success: "User created successfully", user })
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: "Error creating user" })
  }
})

/*******************************DELETE USERS**************************************** */
router.delete("/:id", auth, async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!mongoose.Types.ObjectId.isValid(req.params.id) || !user) {
    return req.status(400).json({ error: "No such id or user" })
  }
  //checks if the user own the user
  if (user.address !== req.user) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  try {
    await user.deleteOne()
    res.status(200).json({ success: "User deleted successfully" })
  } catch (err) {
    res.status(400).json({ error: "Error deleting user" })
  }
})

/*************************************UPDATE USERS**************************************** */

router.put("/:id", auth, async (req, res) => {
  const { address, username, friends, preferences } = req.body
  const user = await User.findById(req.params.id)
  if (user.address !== req.user) {
    return res.status(401).json({ error: "Unauthorized" })
  }
  if (!req.params.id) {
    return res.status(400).json({ error: "Invalid request" })
  }
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Invalid id" })
  }
  try {
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    if (user.username == username) {
      return res.status(400).json({ error: "You already have this username" })
    }
    if (user.username != "" && username == "") {
      user.username = ""
      console.log("Username removed")
    }
    if (user.username !== username && username !== undefined) {
      const exist = await User.findOne({ username })
      if (exist) {
        return res.status(400).json({ error: "Username already exist" })
      }
      user.username = username
      console.log("username updated")
    }

    if (user.address !== address && address !== undefined) {
      user.address = address
      console.log("address updated")
    }
    if (user.friends !== friends && friends !== undefined) {
      user.friends = friends
      console.log("friends updated")
    }
    if (user.preferences !== preferences && preferences !== undefined) {
      user.preferences = preferences
      console.log("preferences updated")
    }

    await user.save() // what this basically does is it saves the user in the database
    res.status(200).json({ success: "User updated successfully" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Error updating user" + err })
  }
})

export { router as usersRoutes }
