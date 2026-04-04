const mineflayer = require("mineflayer");
const express = require("express");
const chalk = require("chalk"); // Cần cài: npm install chalk@4.1.2

// ================= [ CẤU HÌNH ĐỘC QUYỀN ] =================
const CONFIG = {
    host: "warmhousesmp.nethr.nl",
    port: 9598,
    username: "Dream",
    version: "1.20.1",
    password: "bot123",
    reconnectDelay: 15000,
    spam: {
        enabled: true,
        interval: 60000, // 60 giây chat 1 lần
        messages: [
            "⭐ Cookies SMP is the best!",
            "🔥 Top 1 Server Minecraft VN",
            "💎 KimAnh2k9 bot is online",
            "🚀 Optimization by Boss Tool Ultimate"
        ]
    }
};

let bot;
let state = {
    isLoggedIn: false,
    retryCount: 0
};

// ================= [ HỆ THỐNG LOG CHUYÊN NGHIỆP ] =================
const logger = {
    info: (msg) => console.log(chalk.blue(`[INFO] `) + msg),
    success: (msg) => console.log(chalk.green(`[SUCCESS] `) + msg),
    warn: (msg) => console.log(chalk.yellow(`[WARN] `) + msg),
    error: (msg) => console.log(chalk.red(`[ERROR] `) + msg),
    system: (msg) => console.log(chalk.magenta.bold(`\n=== ${msg} ===\n`))
};

function initBot() {
    logger.system("KHỞI CHẠY HỆ THỐNG BOT ĐỘC QUYỀN");
    
    bot = mineflayer.createBot({
        host: CONFIG.host,
        port: CONFIG.port,
        username: CONFIG.username,
        version: CONFIG.version,
        hideErrors: true
    });

    setupEvents();
}

function setupEvents() {
    // 1. XỬ LÝ ĐĂNG NHẬP THÔNG MINH
    bot.on("messagestr", (message) => {
        const msg = message.toLowerCase();
        
        if (msg.includes("/register")) {
            logger.warn("Yêu cầu đăng ký mới...");
            bot.chat(`/register ${CONFIG.password} ${CONFIG.password}`);
        } 
        else if (msg.includes("/login")) {
            logger.info("Đang gửi lệnh đăng nhập...");
            bot.chat(`/login ${CONFIG.password}`);
        }
        
        // Nhận diện khi đã vào server thành công (tùy server)
        if (msg.includes("thành công") || msg.includes("success") || msg.includes("welcome")) {
            state.isLoggedIn = true;
        }
    });

    // 2. KHI VÀO THẾ GIỚI (SPAWN)
    bot.once("spawn", () => {
        logger.success(`Đã kết nối tới ${CONFIG.host}:${CONFIG.port}`);
        state.isLoggedIn = true;
        
        // Kích hoạt các module chức năng
        startAntiAFK();
        if (CONFIG.spam.enabled) startSpamModule();
    });

    // 3. MODULE CHỐNG AFK (ANTI-KICK)
    function startAntiAFK() {
        setInterval(() => {
            if (!bot.entity) return;
            
            // Nhảy và xoay ngẫu nhiên
            bot.setControlState("jump", true);
            const yaw = Math.random() * Math.PI * 2;
            bot.look(yaw, 0);
            
            setTimeout(() => bot.setControlState("jump", false), 500);
            bot.swingArm();
            
            logger.info("Anti-AFK: Đang thực hiện hành động giữ kết nối.");
        }, 15000); 
    }

    // 4. MODULE SPAM (QUẢNG CÁO/CHAT)
    function startSpamModule() {
        setInterval(() => {
            if (!state.isLoggedIn) return;
            const randomMsg = CONFIG.spam.messages[Math.floor(Math.random() * CONFIG.spam.messages.length)];
            bot.chat(randomMsg);
            logger.success(`Spam: ${randomMsg}`);
        }, CONFIG.spam.interval);
    }

    // 5. XỬ LÝ LỖI & TỰ ĐỘNG KẾT NỐI LẠI
    bot.on("kicked", (reason) => {
        logger.error(`Bị Kick: ${reason}`);
    });

    bot.on("end", () => {
        state.isLoggedIn = false;
        logger.warn(`Mất kết nối. Thử lại sau ${CONFIG.reconnectDelay/1000}s...`);
        setTimeout(initBot, CONFIG.reconnectDelay);
    });

    bot.on("error", (err) => {
        if (err.code === "ECONNREFUSED") {
            logger.error(`Không thể kết nối tới IP: ${err.address}`);
        } else {
            logger.error(`Lỗi hệ thống: ${err.message}`);
        }
    });
}

// ================= [ WEB UI SERVER ] =================
const app = express();
app.get("/", (req, res) => {
    res.json({
        status: "Online",
        bot_name: CONFIG.username,
        server: CONFIG.host,
        logged_in: state.isLoggedIn
    });
});

app.listen(3000, () => {
    logger.info("Trang quản lý Bot chạy tại Port 3000");
});

initBot();
