const mineflayer = require("mineflayer");
const express = require("express");

const CONFIG = {
    host: "warmhousesmp.nethr.nl",
    port: 9598,
    username: "OmaChi",
    version: "1.20.1",
    password: "bot123",
    reconnectDelay: 10000
};

function createBot() {
    console.log("[SYSTEM] Đang khởi động Bot chuyên nghiệp...");

    const bot = mineflayer.createBot({
        host: CONFIG.host,
        port: CONFIG.port,
        username: CONFIG.username,
        version: CONFIG.version
    });

    // --- TỰ ĐỘNG ĐĂNG NHẬP/ĐĂNG KÝ ---
    bot.on("messagestr", (msg) => {
        const message = msg.toLowerCase();
        if (message.includes("/register")) {
            bot.chat(`/register ${CONFIG.password} ${CONFIG.password}`);
        } else if (message.includes("/login")) {
            bot.chat(`/login ${CONFIG.password}`);
        }
    });

    bot.once("spawn", () => {
        console.log(`[SUCCESS] Bot ${bot.username} đã online!`);
        startBrain(bot);
    });

    // --- XỬ LÝ LỖI & RECONNECT ---
    bot.on("error", (err) => console.log("[ERROR]", err.message));
    bot.on("end", (reason) => {
        console.log(`[WARN] Mất kết nối (${reason}). Đang hồi sinh sau 10s...`);
        setTimeout(createBot, CONFIG.reconnectDelay);
    });
}

// --- HỆ THỐNG TRÍ TUỆ NHÂN TẠO CỦA BOT ---
function startBrain(bot) {
    
    // 1. Module: Tự động ăn (Không cần Plugin)
    setInterval(() => {
        if (bot.food < 16) { // Nếu thanh thức ăn dưới 8 đùi thịt
            const food = bot.inventory.items().find(item => 
                ["cooked_beef", "cooked_chicken", "bread", "apple", "cooked_porkchop"].includes(item.name)
            );
            if (food) {
                bot.equip(food, "hand")
                    .then(() => bot.consume())
                    .catch(() => {});
            }
        }
    }, 10000);

    // 2. Module: Hành động như người thật (Clear & Pro)
    setInterval(() => {
        if (!bot.entity) return;

        // Xoay đầu tự nhiên
        const yaw = Math.random() * Math.PI * 2;
        const pitch = (Math.random() - 0.5) * 0.5;
        bot.look(yaw, pitch, false);

        // Vung tay ngẫu nhiên
        bot.swingArm();

        // Nhảy nếu bị kẹt hoặc ngẫu nhiên
        if (Math.random() > 0.8) {
            bot.setControlState("jump", true);
            setTimeout(() => bot.setControlState("jump", false), 500);
        }
    }, 15000);

    // 3. Module: Chat quảng bá Warm House
    const ads = [
        "🏠 Chào mừng bạn đến với Warm House SMP!",
        "✨ Chúc mọi người một ngày chơi game vui vẻ.",
        "🔥 Server sinh tồn tự nhiên, cực mượt tại warmhousesmp.nethr.nl",
        "💎 Tôi là Bot hỗ trợ của Warm House."
    ];
    setInterval(() => {
        const msg = ads[Math.floor(Math.random() * ads.length)];
        bot.chat(msg);
    }, 120000);
}

// --- WEB SERVER (BẮT BUỘC ĐỂ RENDER KHÔNG STOP BOT) ---
const app = express();
app.get("/", (req, res) => res.send("Bot Warm House: Online ✅"));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`[WEB] Server chạy tại port ${PORT}`));

createBot();
