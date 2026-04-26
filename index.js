const express = require('express');
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Bot 5-8 saniye korumalı modda çalışıyor...");
});

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda dinleniyor.`);
});

const token = process.env.TOKEN;
const message = process.env.MESSAGE;
const channelIds = process.env.CHANNEL_IDS ? process.env.CHANNEL_IDS.split(",") : [];

let currentIndex = 0;
let isWaiting = false;

if (!token || channelIds.length === 0 || !message) {
    console.error("HATA: TOKEN, CHANNEL_IDS veya MESSAGE eksik!");
} else {
    startLoop();
}

function startLoop() {
    if (isWaiting) return;

    // 5000ms (5s) ile 8000ms (8s) arasında rastgele bir süre belirler
    const randomDelay = Math.floor(Math.random() * (8000 - 5000 + 1) + 5000);
    
    setTimeout(() => {
        sendMessage();
    }, randomDelay);
}

function sendMessage() {
    const currentChannel = channelIds[currentIndex].trim();

    axios.post(`https://discord.com/api/v9/channels/${currentChannel}/messages`, {
        content: message
    }, {
        headers: {
            "Authorization": token,
            "Content-Type": "application/json"
        }
    }).then(() => {
        console.log(`✅ [${currentIndex + 1}/${channelIds.length}] Kanal: ${currentChannel} -> Gönderildi (${(Date.now() % 10000)}ms)`);
        
        currentIndex = (currentIndex + 1) % channelIds.length;
        startLoop(); 
    }).catch((err) => {
        if (err.response?.status === 429) {
            const retryAfter = (err.response.data.retry_after * 1000) || 60000;
            console.error(`⚠️ RATE LIMIT! ${retryAfter/1000} saniye mola...`);
            isWaiting = true;
            setTimeout(() => { 
                isWaiting = false; 
                startLoop(); 
            }, retryAfter);
        } else {
            console.error(`❌ Hata (${currentChannel}):`, err.response?.status);
            currentIndex = (currentIndex + 1) % channelIds.length;
            startLoop();
        }
    });
}
