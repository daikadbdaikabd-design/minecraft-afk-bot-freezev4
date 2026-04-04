const mineflayer = require("mineflayer");
const express = require("express");

let bot;
let moveInterval;
let chatInterval;
let lookInterval;

function startBot() {
  console.log("Đang khởi động bot...");

  bot = mineflayer.createBot({
    host: "warmhousesmp.nethr.nl",
    port: 9598,
    username: "KimAnh2k9",
    version: "1.20.1",
  });

  // PHẦN QUAN TRỌNG: TỰ ĐỘNG LOGIN/REGISTER
  bot.on("messagestr", (message) => {
    const msg = message.toLowerCase();
    
    if (msg.includes("/register")) {
      console.log("Phát hiện yêu cầu đăng ký...");
      bot.chat("/register bot123 bot123");
    } 
    else if (msg.includes("/login")) {
      console.log("Phát hiện yêu cầu đăng nhập...");
      bot.chat("/login bot123");
    }
  });

  bot.once("spawn", () => {
    console.log("Bot đã vào world!");

    // Đợi 3 giây sau khi spawn mới bắt đầu hành động để tránh lag/kick
    setTimeout(() => {
      startActions();
    }, 3000);
  });

  function startActions() {
    // DI CHUYỂN NGẪU NHIÊN
    moveInterval = setInterval(() => {
      if (!bot.entity) return;

      const actions = ["forward", "back", "left", "right"];
      const action = actions[Math.floor(Math.random() * actions.length)];

      bot.setControlState(action, true);
      bot.setControlState("jump", true);

      setTimeout(() => {
        bot.setControlState("jump", false);
        bot.clearControlStates();
      }, 600);

      bot.swingArm();
    }, 4000);

    // XOAY ĐẦU
    lookInterval = setInterval(() => {
      const yaw = Math.random() * Math.PI * 2;
      const pitch = (Math.random() - 0.5) * 0.5;
      bot.look(yaw, pitch, true);
    }, 3000);

    // CHAT NGẪU NHIÊN
    const messages = ["hello", "hi everyone", "nice server", "anyone online?", "im here", "lol"];
    chatInterval = setInterval(() => {
      const msg = messages[Math.floor(Math.random() * messages.length)];
      bot.chat(msg);
    }, 90000);
  }

  // XỬ LÝ LỖI VÀ RECONNECT
  bot.on("end", (reason) => {
    console.log(`Bot mất kết nối do: ${reason}. Reconnect sau 10s...`);
    clearIntervals();
    setTimeout(startBot, 10000);
  });

  bot.on("error", (err) => console.log("Lỗi:", err.message));
  bot.on("kicked", (reason) => console.log("Bot bị kick:", reason));
}

function clearIntervals() {
  clearInterval(moveInterval);
  clearInterval(chatInterval);
  clearInterval(lookInterval);
}

startBot();

// WEB SERVER GIỮ BOT ONLINE
const app = express();
app.get("/", (req, res) => res.send("Bot Minecraft đang chạy"));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Web server chạy port", PORT));
