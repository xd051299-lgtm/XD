const express = require('express');
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("20 Kanallı Senkronize Bot Sistemi Aktif!");
});

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});

// Render Environment Variables
const tokensRaw = process.env.TOKENS; 
const channelId = process.env.CHANNEL_ID;
const messages = [process.env.MESSAGE1, process.env.MESSAGE2];

if (!tokensRaw || !channelId || !messages[0] || !messages[1]) {
    console.error("HATA: TOKENS, CHANNEL_ID, MESSAGE1 veya MESSAGE2 eksik!");
} else {
    const tokenList = tokensRaw.split(",").map(t => t.trim());
    
    // Toplam döngü süresi (5 saniye)
    const cycleTime = 5000; 
    // Her bot arasındaki gecikme (5000 / 20 = 250ms)
    const staggerDelay = cycleTime / tokenList.length; 

    console.log(`${tokenList.length} bot için ${staggerDelay}ms aralıklı düzen kuruldu.`);

    tokenList.forEach((token, index) => {
        // Her botun ilk başlama zamanını kaydırıyoruz
        const initialOffset = index * staggerDelay;

        setTimeout(() => {
            // İlk mesajı gönder
            sendRequest(token, index + 1);

            // Ardından her 5 saniyede bir tekrarla
            setInterval(() => {
                sendRequest(token, index + 1);
            }, cycleTime);

            console.log(`Bot ${index + 1} kuyruğa girdi (Zamanlama: +${initialOffset}ms)`);
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
            console.error(`[Bot ${botNum}] ⚠️ Rate Limit!`);
        } else {
            console.error(`[Bot ${botNum}] ❌ Hata: ${err.response?.status}`);
        }
    });
}
