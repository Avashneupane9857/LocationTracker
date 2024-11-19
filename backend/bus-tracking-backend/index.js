const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/bus-tracking", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const busSchema = new mongoose.Schema({
  busId: String,
  latitude: Number,
  longitude: Number,
  timestamp: Date,
});

const Bus = mongoose.model("Bus", busSchema);

app.post("/api/bus-location", async (req, res) => {
  const { busId, latitude, longitude } = req.body;
  const newLocation = new Bus({
    busId,
    latitude,
    longitude,
    timestamp: new Date(),
  });
  await newLocation.save();

  io.emit("bus-location-update", { busId, latitude, longitude });
  res.status(200).send("Location updated");
});

app.get("/api/bus-locations", async (req, res) => {
  const locations = await Bus.find({}).sort({ timestamp: -1 });
  res.json(locations);
});

io.on("connection", (socket) => {
  console.log("User connected");
  socket.on("disconnect", () => console.log("User disconnected"));
});

server.listen(3001, () => console.log("Backend running on port 3001"));
