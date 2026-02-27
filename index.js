const express = require('express');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("8 Botlu Sistem Aktif - Güvenli Mod");
});

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda aktif.`);
});

const tokensRaw = process.env.TOKENS; 
const channelId = process.env.CHANNEL_ID ? process.env.CHANNEL_ID.trim() : null;
const msg1 = process.env.MESSAGE1;

if (!tokensRaw || !channelId || !msg1) {
    console.error("HATA: Değişkenler eksik! Render panelini kontrol et.");
} else {
    const tokenList = tokensRaw.split(",").map(t => t.trim()).filter(t => t.length > 0);
    
    // Rate limit yememek için süreyi 8 saniye (8000ms) yaptık
    const cycleTime = 8000; 
    const staggerDelay = cycleTime / tokenList.length; 

    tokenList.forEach((token, index) => {
        const initialOffset = index * staggerDelay;

        setTimeout(() => {
            sendRequest(token, index + 1);

            setInterval(() => {
                sendRequest(token, index + 1);
            }, cycleTime);

            console.log(`[Bot ${index + 1}] Başlatıldı.`);
        }, initialOffset);
    });
}

async function sendRequest(token, botNum) {
    const url = `https://discord.com/api/v9/channels/${channelId}/messages`;
    try {
        await axios.post(url, { content: msg1 }, {
            headers: { 'Authorization': token, 'Content-Type': 'application/json' }
        });
        console.log(`[Bot ${botNum}] ✅ Başarılı`);
    } catch (err) {
        if (err.response?.status === 429) {
            console.error(`[Bot ${botNum}] ⚠️ Hız Sınırı!`);
        } else {
            console.error(`[Bot ${botNum}] ❌ Hata: ${err.response?.status}`);
        }
    }
}
