import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import Report from "./models/Report.js";
import User from "./models/User.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    credentials: true,
  },
});

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

let onlineUsers = 0;
let waitingUsers = [];
const roomUsers = new Map();

function safeObjectId(id) {
  if (!id) return null;
  return mongoose.Types.ObjectId.isValid(id) ? id : null;
}

function isMatch(userA, userB) {
  const aPref = userA.preference || "any";
  const bPref = userB.preference || "any";

  const aGender = userA.gender || "other";
  const bGender = userB.gender || "other";

  const aAcceptsB = aPref === "any" || aPref === bGender;
  const bAcceptsA = bPref === "any" || bPref === aGender;

  return aAcceptsB && bAcceptsA;
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  onlineUsers++;
  io.emit("online-users", onlineUsers);

  socket.on("join-queue", async (userData) => {
    try {
      waitingUsers = waitingUsers.filter(
        (user) => user.socketId !== socket.id
      );

      const userId = safeObjectId(
        userData?.userId || userData?._id || userData?.id
      );

      if (userId) {
        const dbUser = await User.findById(userId).select(
          "username isBanned bannedReason"
        );

        if (dbUser?.isBanned) {
          socket.emit("user-banned", {
            message: "You are banned from using live chat.",
            reason: dbUser.bannedReason || "Banned by admin",
          });

          return;
        }
      }

      const currentUser = {
        socketId: socket.id,
        userId,
        username: userData?.username || "User",
        gender: userData?.gender || "other",
        preference: userData?.preference || "any",
        premium: userData?.premium || false,
      };

      const partner = waitingUsers.find((user) =>
        isMatch(currentUser, user)
      );

      if (partner) {
        waitingUsers = waitingUsers.filter(
          (user) => user.socketId !== partner.socketId
        );

        const roomId = `room-${socket.id}-${partner.socketId}`;

        socket.join(roomId);

        const partnerSocket = io.sockets.sockets.get(partner.socketId);

        if (partnerSocket) {
          partnerSocket.join(roomId);
        }

        const users = [
          {
            socketId: socket.id,
            userId: currentUser.userId,
            username: currentUser.username,
            gender: currentUser.gender,
          },
          {
            socketId: partner.socketId,
            userId: partner.userId,
            username: partner.username,
            gender: partner.gender,
          },
        ];

        roomUsers.set(roomId, users);

        io.to(roomId).emit("match-found", {
          roomId,
          initiator: socket.id,
          users,
        });
      } else {
        waitingUsers.push(currentUser);
        socket.emit("waiting-for-match");
      }
    } catch (error) {
      console.log("Join queue error:", error.message);
      socket.emit("matching-error", {
        message: "Something went wrong while joining queue.",
      });
    }
  });

  socket.on("send-message", (data) => {
    if (!data?.roomId || !data?.message) return;

    io.to(data.roomId).emit("receive-message", {
      message: data.message,
      sender: socket.id,
      createdAt: new Date(),
    });
  });

  socket.on("webrtc-signal", (data) => {
    if (!data?.roomId || !data?.signal) return;

    socket.to(data.roomId).emit("webrtc-signal", {
      signal: data.signal,
      sender: socket.id,
    });
  });

  socket.on("end-chat", (data) => {
    if (!data?.roomId) return;

    socket.to(data.roomId).emit("partner-ended-chat");
    socket.leave(data.roomId);
    roomUsers.delete(data.roomId);
  });

  socket.on("report-user", async (data) => {
    try {
      if (!data?.roomId || !data?.reason) return;

      const usersInRoom = roomUsers.get(data.roomId) || [];

      const reporterFromRoom = usersInRoom.find(
        (item) => item.socketId === socket.id
      );

      const reportedFromRoom = usersInRoom.find(
        (item) => item.socketId !== socket.id
      );

      await Report.create({
        reporterUserId: safeObjectId(
          data.reporterUserId || reporterFromRoom?.userId
        ),
        reporterUsername:
          data.reporterUsername ||
          reporterFromRoom?.username ||
          "Unknown User",

        reportedUserId: safeObjectId(
          data.reportedUserId || reportedFromRoom?.userId
        ),
        reportedUsername:
          data.reportedUsername ||
          reportedFromRoom?.username ||
          "Stranger",

        reporterSocket: socket.id,
        reportedSocket:
          data.reportedSocket || reportedFromRoom?.socketId || "",

        roomId: data.roomId,
        reason: data.reason,
      });

      socket.emit("report-success", {
        message: "Report submitted successfully",
      });
    } catch (error) {
      console.log("Report error:", error.message);

      socket.emit("report-success", {
        message: "Report failed",
      });
    }
  });

  socket.on("next-user", () => {
    waitingUsers = waitingUsers.filter(
      (user) => user.socketId !== socket.id
    );

    socket.emit("waiting-for-match");
  });

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);

    onlineUsers = Math.max(0, onlineUsers - 1);

    waitingUsers = waitingUsers.filter(
      (user) => user.socketId !== socket.id
    );

    for (const [roomId, users] of roomUsers.entries()) {
      const userInsideRoom = users.find(
        (item) => item.socketId === socket.id
      );

      if (userInsideRoom) {
        socket.to(roomId).emit("partner-ended-chat");
        roomUsers.delete(roomId);
      }
    }

    io.emit("online-users", onlineUsers);
  });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");

    server.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });