import express from "express"
import mongoose from "mongoose"
//import { filesRoutes } from "${__dirname}/routes/filesRoutes.js"
import { chatRoutes } from "./routes/chatRoutes.js"
import { usersRoutes } from "./routes/usersRoutes.js"
import { nodesRoutes } from "./routes/nodesRoutes.js"
const app = express() // what this does is it creates a new express application

app.use(express.json()) // what this does is it allows us to parse JSON data from the request body so we can use it in our routes

app.use("/api/chats", chatRoutes) // what this does basically is it tells express to use the chatRoutes file in the routes folder meaning it will be used for all requests that start with /api/posts
app.use("/api/users", usersRoutes)
app.use("/api/nodes", nodesRoutes)
//app.use("/api/files", nodesRoutes) // using piniata for pinning them

mongoose
  .connect("mongodb://localhost:27017/ubuntu") // what this does is it connects to the MongoDB database and creates a new database called mydb
  .then(() => {
    console.log("Connected to MongoDB")
    // after connecting to MongoDB we start the server
    app.listen(3002, "localhost", () => {
      console.log("Server running on port 3001")
    })
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB:", err)
  })
