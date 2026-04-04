const mineflayer = require("mineflayer")
const express = require("express")

let bot
let moveInterval
let chatInterval
let lookInterval

function startBot() {

  console.log("Đang khởi động bot...")

  bot = mineflayer.createBot({
    host: "warmhousesmp.nethr.nl",
    port: 9598,
    username: "KimAnh2k9",
    version: "1.20.1"
  })

  bot.once("spawn", () => {

    console.log("Bot đã vào world")

    // DI CHUYỂN NGẪU NHIÊN
    moveInterval = setInterval(() => {

      if (!bot.entity) return

      const actions = ["forward","back","left","right"]
      const action = actions[Math.floor(Math.random()*actions.length)]

      bot.clearControlStates()
      bot.setControlState(action, true)

      // nhảy
      bot.setControlState("jump", true)

      setTimeout(() => {
        bot.setControlState("jump", false)
        bot.clearControlStates()
      }, 600)

      // vung tay
      bot.swingArm()

    }, 4000)

    // XOAY ĐẦU NHƯ PLAYER
    lookInterval = setInterval(() => {

      const yaw = Math.random() * Math.PI * 2
      const pitch = (Math.random() - 0.5) * 0.5

      bot.look(yaw, pitch, true)

    }, 3000)

    // CHAT NGẪU NHIÊN
    const messages = [
      "hello",
      "hi everyone",
      "nice server",
      "anyone online?",
      "im here",
      "lol"
    ]

    chatInterval = setInterval(() => {

      const msg = messages[Math.floor(Math.random()*messages.length)]
      bot.chat(msg)

    }, 90000)

  })

  bot.on("message", (jsonMsg) => {

    const msg = jsonMsg.toString()

    if (msg.includes("/register"))
      bot.chat("/register bot123 bot123")

    if (msg.includes("/login"))
      bot.chat("/login bot123")

  })

  bot.on("end", () => {

    console.log("Bot mất kết nối, reconnect sau 10s...")

    clearInterval(moveInterval)
    clearInterval(chatInterval)
    clearInterval(lookInterval)

    setTimeout(startBot, 10000)

  })

  bot.on("error", (err) => console.log("Lỗi:", err.message))
  bot.on("kicked", (reason) => console.log("Bot bị kick:", reason))
}

startBot()

// web server để giữ bot online (Render/UptimeRobot)
const app = express()

app.get("/", (req,res)=>{
  res.send("Bot Minecraft đang chạy")
})

const PORT = process.env.PORT || 3000

app.listen(PORT, ()=>{
  console.log("Web server chạy port",PORT)
})
