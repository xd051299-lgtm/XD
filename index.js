const express = require('express');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("17 Botlu Sistem Aktif - Döngü: 5 Saniye");
});

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda aktif.`);
});

const tokensRaw = process.env.TOKENS; 
const channelsRaw = process.env.CHANNEL_IDS; 
const msg1 = process.env.MESSAGE1;
const msg2 = process.env.MESSAGE2;

if (!tokensRaw || !channelsRaw || !msg1) {
    console.error("HATA: Değişkenler eksik!");
} else {
    const tokenList = tokensRaw.split(",").map(t => t.trim()).filter(t => t.length > 0);
    const channelList = channelsRaw.split(",").map(c => c.trim()).filter(c => c.length > 0);
    
    // İsteğin üzerine: Her hesap 5 saniyede bir atacak
    const cycleTime = 5000; 
    const staggerDelay = cycleTime / tokenList.length; // ~294ms aralık

    console.log(`${tokenList.length} bot için 5 saniyelik döngü kuruldu.`);

    tokenList.forEach((token, index) => {
        const initialOffset = index * staggerDelay;

        setTimeout(() => {
            sendToAllChannels(token, index + 1, channelList);

            setInterval(() => {
                sendToAllChannels(token, index + 1, channelList);
            }, cycleTime);

            console.log(`[Bot ${index + 1}] Sıraya girdi (+${Math.round(initialOffset)}ms)`);
        }, initialOffset);
    });
}

async function sendToAllChannels(token, botNum, channelList) {
    const headers = { 'Authorization': token, 'Content-Type': 'application/json' };

    for (const channelId of channelList) {
        const url = `https://discord.com/api/v9/channels/${channelId}/messages`;
        
        try {
            await axios.post(url, { content: msg1.toString() }, { headers });
            
            if (msg2) {
                await new Promise(r => setTimeout(r, 300)); // İki mesaj arası güvenli boşluk
                await axios.post(url, { content: msg2.toString() }, { headers });
            }
            console.log(`[Bot ${botNum}] ✅ Kanal ${channelId} -> Gönderildi`);
        } catch (err) {
            console.error(`[Bot ${botNum}] ❌ Hata: ${err.response?.status}`);
        }
        await new Promise(r => setTimeout(r, 250)); // Kanallar arası güvenli boşluk
    }
}
