const mineflayer = require("mineflayer");
const express = require("express");

// CẤU HÌNH HỆ THỐNG
const SETTINGS = {
    host: "warmhousesmp.nethr.nl",
    port: 9598,
    username: "Skeleten2k12",
    version: "1.20.1",
    password: "bot123", // Thay mật khẩu của bạn
    reconnectDelay: 10000
};

function startBot() {
    console.log(`[${new Date().toLocaleTimeString()}] Đang kết nối tới Warm House SMP...`);

    const bot = mineflayer.createBot({
        host: SETTINGS.host,
        port: SETTINGS.port,
        username: SETTINGS.username,
        version: SETTINGS.version,
        checkTimeoutInterval: 60000
    });

    // 1. TỰ ĐỘNG LOGIN / REGISTER (NHANH & GỌN)
    bot.on("messagestr", (msg) => {
        const message = msg.toLowerCase();
        if (message.includes("/register")) {
            bot.chat(`/register ${SETTINGS.password} ${SETTINGS.password}`);
        } else if (message.includes("/login")) {
            bot.chat(`/login ${SETTINGS.password}`);
        }
    });

    // 2. KHI VÀO GAME
    bot.once("spawn", () => {
        console.log(`[SUCCESS] Bot ${bot.username} đã online thành công!`);
        
        // Chạy các hành động duy trì kết nối
        setInterval(() => {
            if (!bot.entity) return;

            // Xoay đầu ngẫu nhiên như người thật
            const yaw = Math.random() * Math.PI * 2;
            const pitch = (Math.random() - 0.5) * 0.5;
            bot.look(yaw, pitch, false);

            // Hành động vung tay
            bot.swingArm();

            // Nhảy ngẫu nhiên (Anti-AFK chuyên nghiệp)
            if (Math.random() > 0.7) {
                bot.setControlState("jump", true);
                setTimeout(() => bot.setControlState("jump", false), 500);
            }
        }, 15000);

        // Chat quảng bá Server (Tần suất vừa phải)
        setInterval(() => {
            const ads = [
                "🏠 Chào mừng bạn đến với Warm House SMP!",
                "✨ Chúc mọi người chơi game vui vẻ tại warmhousesmp.nethr.nl",
                "🔥 Server mượt, cộng đồng chất lượng!",
                "💎 Support Warm House nhiệt tình nhé anh em."
            ];
            bot.chat(ads[Math.floor(Math.random() * ads.length)]);
        }, 150000); 
    });

    // 3. XỬ LÝ LỖI VÀ TỰ KẾT NỐI LẠI
    bot.on("end", (reason) => {
        console.log(`[WARN] Mất kết nối: ${reason}. Reconnect sau 10s...`);
        setTimeout(startBot, SETTINGS.reconnectDelay);
    });

    bot.on("error", (err) => console.log("[ERROR]", err.message));
    bot.on("kicked", (reason) => console.log("[KICKED]", reason));
}

// WEB SERVER (Giữ cho Render không tắt Bot)
const app = express();
app.get("/", (req, res) => res.send("Warm House Bot Status: Online ✅"));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`[WEB] Server đang chạy tại port ${PORT}`));

// Khởi chạy
startBot();
