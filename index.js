const mineflayer = require("mineflayer");
const express = require("express");

// --- CẤU HÌNH HỆ THỐNG ĐỘC QUYỀN ---
const SETTINGS = {
    host: "warmhousesmp.nethr.nl",
    port: 9598,
    username: "Dream",
    version: "1.20.1",
    password: "bot123", // Mật khẩu của bạn
    reconnectDelay: 20000 // 20 giây thử lại nếu mất kết nối
};

function startBot() {
    console.log(`[${new Date().toLocaleTimeString()}] Đang khởi động hệ thống Bot...`);

    const bot = mineflayer.createBot({
        host: SETTINGS.host,
        port: SETTINGS.port,
        username: SETTINGS.username,
        version: SETTINGS.version,
        checkTimeoutInterval: 60000
    });

    // 1. TỰ ĐỘNG ĐĂNG KÝ / ĐĂNG NHẬP
    bot.on("messagestr", (msg) => {
        const message = msg.toLowerCase();
        // Nhận diện lệnh đăng ký
        if (message.includes("/register")) {
            console.log("-> Đang thực hiện đăng ký...");
            bot.chat(`/register ${SETTINGS.password} ${SETTINGS.password}`);
        } 
        // Nhận diện lệnh đăng nhập
        else if (message.includes("/login")) {
            console.log("-> Đang thực hiện đăng nhập...");
            bot.chat(`/login ${SETTINGS.password}`);
        }
    });

    // 2. KHI VÀO GAME (SPAWN)
    bot.once("spawn", () => {
        console.log(`[SUCCESS] Bot ${bot.username} đã vào game!`);

        // MODULE: NHẢY 1 GIÂY 1 LẦN (THEO YÊU CẦU)
        setInterval(() => {
            if (bot.entity) {
                bot.setControlState('jump', true);
                setTimeout(() => bot.setControlState('jump', false), 400);
            }
        }, 1000); // Đúng 1 giây nhảy 1 lần

        // MODULE: VUNG TAY & XOAY ĐẦU (REALISTIC)
        setInterval(() => {
            if (bot.entity) {
                const yaw = Math.random() * Math.PI * 2;
                const pitch = (Math.random() - 0.5) * 0.5;
                bot.look(yaw, pitch, false);
                bot.swingArm();
            }
        }, 3000); // 3 giây xoay đầu 1 lần

        // MODULE: CHAT QUẢNG BÁ (CHỐNG SPAM KICK)
        setInterval(() => {
            const ads = [
                "🏠 Chào mừng bạn đến với Warm House SMP!",
                "✨ Server mượt mà - Trải nghiệm cực đã!",
                "🔥 warmhousesmp.nethr.nl - Join ngay anh em ơi!",
                "💎 Chúc mọi người chơi game vui vẻ!"
            ];
            bot.chat(ads[Math.floor(Math.random() * ads.length)]);
        }, 120000); // 2 phút chat 1 lần để an toàn
    });

    // 3. FIX LỖI KẾT NỐI & TỰ ĐỘNG RECONNECT
    bot.on("end", (reason) => {
        console.log(`[WARN] Mất kết nối (${reason}). Đang đợi để quay lại...`);
        setTimeout(startBot, SETTINGS.reconnectDelay);
    });

    bot.on("error", (err) => {
        console.log("[ERROR] Gặp lỗi:", err.message);
    });

    bot.on("kicked", (reason) => {
        console.log("[KICKED] Bị kick vì:", reason);
    });
}

// --- WEB SERVER GIỮ BOT ONLINE 24/7 ---
const app = express();
app.get("/", (req, res) => res.send("Bot Warm House: Đang hoạt động ✅"));
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`[WEB] Server chạy tại port ${PORT}`));

// KÍCH HOẠT
startBot();
