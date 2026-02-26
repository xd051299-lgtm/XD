const express = require('express');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Anti-Spam Korumalı Çoklu Bot Sistemi Aktif!");
});

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});

const tokensRaw = process.env.TOKENS; 
const channelsRaw = process.env.CHANNEL_IDS; 
const msg1 = process.env.MESSAGE1;
const msg2 = process.env.MESSAGE2;

if (!tokensRaw || !channelsRaw || !msg1) {
    console.error("HATA: Gerekli değişkenler eksik!");
} else {
    const tokenList = tokensRaw.split(",").map(t => t.trim()).filter(t => t.length > 0);
    const channelList = channelsRaw.split(",").map(c => c.trim()).filter(c => c.length > 0);
    
    const cycleTime = 3000; 
    const staggerDelay = cycleTime / tokenList.length;

    tokenList.forEach((token, index) => {
        const initialOffset = index * staggerDelay;

        setTimeout(() => {
            sendToAllChannels(token, index + 1, channelList);

            setInterval(() => {
                sendToAllChannels(token, index + 1, channelList);
            }, cycleTime);

            console.log(`[Bot ${index + 1}] Başlatıldı.`);
        }, initialOffset);
    });
}

// Mesajın sonuna rastgele karakter ekleyen yardımcı fonksiyon
function randomizeMessage(text) {
    const randomID = Math.random().toString(36).substring(2, 7); // Örn: a1b2c
    return `${text} [${randomID}]`;
}

async function sendToAllChannels(token, botNum, channelList) {
    const headers = { 'Authorization': token, 'Content-Type': 'application/json' };

    for (const channelId of channelList) {
        const url = `https://discord.com/api/v9/channels/${channelId}/messages`;
        
        try {
            // Mesaj 1'i rastgeleleştirerek gönder
            await axios.post(url, { content: randomizeMessage(msg1) }, { headers });
            
            if (msg2) {
                await new Promise(r => setTimeout(r, 150)); // İki mesaj arası kısa es
                // Mesaj 2'yi rastgeleleştirerek gönder
                await axios.post(url, { content: randomizeMessage(msg2) }, { headers });
            }
            console.log(`[Bot ${botNum}] ✅ Kanal ${channelId} -> Gönderildi`);
        } catch (err) {
            console.error(`[Bot ${botNum}] ❌ Hata: ${err.response?.status}`);
        }
    }
}
