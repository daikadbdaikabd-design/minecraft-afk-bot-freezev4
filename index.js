const mineflayer = require("mineflayer");
const autoeat = require("mineflayer-auto-eat");
const armorManager = require("mineflayer-armor-manager");
const express = require("express");

/**
 * CẤU HÌNH HỆ THỐNG
 */
const SETTINGS = {
    host: "warmhousesmp.nethr.nl",
    port: 9598,
    username: "Dream",
    version: "1.20.1",
    password: "bot123",
    actions: {
        spamInterval: 120000, // 2 phút/lần để tránh bị kick spam
        antiAfkInterval: 15000,
        reconnectDelay: 10000
    }
};

class ProBot {
    constructor() {
        this.bot = null;
        this.init();
    }

    init() {
        console.log(`[SYSTEM] Đang kết nối tới ${SETTINGS.host}...`);
        
        this.bot = mineflayer.createBot({
            host: SETTINGS.host,
            port: SETTINGS.port,
            username: SETTINGS.username,
            version: SETTINGS.version,
            checkTimeoutInterval: 60000
        });

        this.loadPlugins();
        this.bindEvents();
    }

    loadPlugins() {
        this.bot.loadPlugin(autoeat); // Tự động ăn khi đói
        this.bot.loadPlugin(armorManager); // Tự động mặc giáp tốt nhất có trong đồ
    }

    bindEvents() {
        // 1. Xử lý Đăng nhập/Đăng ký tự động
        this.bot.on("messagestr", (msg) => {
            const message = msg.toLowerCase();
            if (message.includes("/register")) {
                this.bot.chat(`/register ${SETTINGS.password} ${SETTINGS.password}`);
            } else if (message.includes("/login")) {
                this.bot.chat(`/login ${SETTINGS.password}`);
            }
        });

        // 2. Khi Bot xuất hiện trong World
        this.bot.once("spawn", () => {
            console.log(`[SUCCESS] ${this.bot.username} đã online tại Warm House SMP!`);
            
            // Cấu hình tự động ăn
            this.bot.autoEat.options.priority = "foodPoints";
            this.bot.autoEat.options.bannedFood = ["rotten_flesh", "spider_eye"];
            
            this.startLifeCycles();
        });

        // 3. Xử lý lỗi và Tự động kết nối lại
        this.bot.on("end", (reason) => {
            console.log(`[WARN] Bot mất kết nối: ${reason}. Thử lại sau 10s...`);
            setTimeout(() => new ProBot(), SETTINGS.actions.reconnectDelay);
        });

        this.bot.on("error", (err) => console.log(`[ERROR] ${err.message}`));
    }

    startLifeCycles() {
        // Module: Di chuyển như người thật (Anti-AFK)
        setInterval(() => {
            if (!this.bot.entity) return;
            
            const randomPitch = (Math.random() - 0.5) * 0.5;
            const randomYaw = Math.random() * Math.PI * 2;
            
            this.bot.look(randomYaw, randomPitch, true);
            this.bot.swingArm(); // Vung tay
            
            // Nhảy ngẫu nhiên
            if (Math.random() > 0.7) {
                this.bot.setControlState("jump", true);
                setTimeout(() => this.bot.setControlState("jump", false), 500);
            }
        }, SETTINGS.actions.antiAfkInterval);

        // Module: Spam quảng bá chuyên nghiệp
        const quotes = [
            "⭐ Warm House SMP - Trải nghiệm Minecraft sinh tồn đích thực!",
            "🔥 Chào mừng mọi người đến với warmhousesmp.nethr.nl",
            "💎 Server ổn định, cộng đồng thân thiện.",
            "🚀 Chúc mọi người chơi game vui vẻ!"
        ];

        setInterval(() => {
            const pick = quotes[Math.floor(Math.random() * quotes.length)];
            this.bot.chat(pick);
        }, SETTINGS.actions.spamInterval);
    }
}

// KHỞI CHẠY WEB SERVER (GIỮ ONLINE TRÊN RENDER/FREEZEHOST)
const app = express();
app.get("/", (req, res) => res.send("Bot Status: <b>Online</b>"));
app.listen(process.env.PORT || 3000, () => console.log("[WEB] Dashboard Ready."));

// KÍCH HOẠT BOT
new ProBot();
