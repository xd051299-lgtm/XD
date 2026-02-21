const express = require('express');
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Bot Sistemi: 8 Saniye Döngü Modu Aktif.");
});

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda aktif.`);
});

const tokensRaw = process.env.TOKENS; 
const channelId = process.env.CHANNEL_ID;
const messages = [process.env.MESSAGE1, process.env.MESSAGE2];

if (!tokensRaw || !channelId || !messages[0] || !messages[1]) {
    console.error("HATA: Değişkenler eksik! Lütfen Render panelini kontrol et.");
} else {
    const tokenList = tokensRaw.split(",").map(t => t.trim());
    
    // Sabit Döngü: 8 Saniye
    const cycleTime = 8000; 
    // Otomatik Gecikme: 8000 / 19 = ~421ms
    const staggerDelay = cycleTime / tokenList.length; 

    console.log(`Sistem Başlatıldı: ${tokenList.length} bot, ${Math.round(staggerDelay)}ms aralıkla çalışacak.`);

    tokenList.forEach((token, index) => {
        const initialOffset = index * staggerDelay;

        setTimeout(() => {
            // İlk tetikleme
            sendRequest(token, index + 1);

            // Periyodik döngü
            setInterval(() => {
                sendRequest(token, index + 1);
            }, cycleTime);

            console.log(`[Sıra ${index + 1}] Bot kuyruğa eklendi (+${Math.round(initialOffset)}ms)`);
        }, initialOffset);
    });
}

function sendRequest(token, botNum) {
    const content = messages[Math.floor(Math.random() * messages.length)];

    axios.post(`https://discord.com/api/v9/channels/${channelId}/messages`, 
    { content: content }, 
    {
        headers: {
            "Authorization": token,
            "Content-Type": "application/json"
        }
    })
    .then(() => {
        console.log(`[Bot ${botNum}] ✅ Mesaj gönderildi.`);
    })
    .catch((err) => {
        if (err.response?.status === 429) {
            console.error(`[Bot ${botNum}] ⚠️ Hız sınırı (Rate Limit)!`);
        } else {
            console.error(`[Bot ${botNum}] ❌ Hata: ${err.response?.status}`);
        }
    });
}
