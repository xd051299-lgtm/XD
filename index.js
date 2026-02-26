const express = require('express');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Çoklu Kanal & Çoklu Bot Sistemi Aktif!");
});

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});

// Render Environment Variables
const tokensRaw = process.env.TOKENS; 
const channelsRaw = process.env.CHANNEL_IDS; // Virgülle ayrılmış ID'ler
const msg1 = process.env.MESSAGE1;
const msg2 = process.env.MESSAGE2;

if (!tokensRaw || !channelsRaw || !msg1) {
    console.error("HATA: TOKENS, CHANNEL_IDS veya MESSAGE1 eksik!");
} else {
    const tokenList = tokensRaw.split(",").map(t => t.trim()).filter(t => t.length > 0);
    const channelList = channelsRaw.split(",").map(c => c.trim()).filter(c => c.length > 0);
    
    const cycleTime = 3000; // 3 Saniye döngü
    const staggerDelay = cycleTime / tokenList.length;

    console.log(`${tokenList.length} bot, ${channelList.length} kanal için başlatılıyor.`);

    tokenList.forEach((token, index) => {
        const initialOffset = index * staggerDelay;

        setTimeout(() => {
            // İlk tetikleme
            sendToAllChannels(token, index + 1, channelList);

            // Periyodik döngü
            setInterval(() => {
                sendToAllChannels(token, index + 1, channelList);
            }, cycleTime);

            console.log(`[Bot ${index + 1}] Aktif (Gecikme: +${Math.round(initialOffset)}ms)`);
        }, initialOffset);
    });
}

async function sendToAllChannels(token, botNum, channelList) {
    const headers = { 'Authorization': token, 'Content-Type': 'application/json' };

    for (const channelId of channelList) {
        const url = `https://discord.com/api/v9/channels/${channelId}/messages`;
        
        try {
            // Önce Mesaj 1
            await axios.post(url, { content: msg1.toString() }, { headers });
            
            // Varsa Mesaj 2 (Arada 100ms kısa boşluk)
            if (msg2) {
                await new Promise(r => setTimeout(r, 100));
                await axios.post(url, { content: msg2.toString() }, { headers });
            }
            console.log(`[Bot ${botNum}] ✅ Kanal ${channelId} -> Başarılı`);
        } catch (err) {
            console.error(`[Bot ${botNum}] ❌ Kanal ${channelId} -> Hata: ${err.response?.status || "Bağlantı"}`);
        }
    }
}
