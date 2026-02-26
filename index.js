const express = require('express');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("17 Botlu Sistem Aktif - Döngü: 3 Saniye");
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
    
    // Döngü süresi 3 saniye olarak ayarlandı
    const cycleTime = 3000; 
    const staggerDelay = cycleTime / tokenList.length; // 17 bot için ~176ms

    console.log(`${tokenList.length} bot için 3 saniyelik (hızlı) döngü kuruldu.`);

    tokenList.forEach((token, index) => {
        const initialOffset = index * staggerDelay;

        setTimeout(() => {
            sendToAllChannels(token, index + 1, channelList);

            setInterval(() => {
                sendToAllChannels(token, index + 1, channelList);
            }, cycleTime);

            console.log(`[Bot ${index + 1}] Yayına girdi (+${Math.round(initialOffset)}ms)`);
        }, initialOffset);
    });
}

async function sendToAllChannels(token, botNum, channelList) {
    const headers = { 'Authorization': token, 'Content-Type': 'application/json' };

    for (const channelId of channelList) {
        const url = `https://discord.com/api/v9/channels/${channelId}/messages`;
        
        try {
            // Mesaj 1
            await axios.post(url, { content: msg1.toString() }, { headers });
            
            if (msg2) {
                // Hızlı döngüde mesajlar arası bekleme 100ms'ye düşürüldü
                await new Promise(r => setTimeout(r, 100)); 
                // Mesaj 2
                await axios.post(url, { content: msg2.toString() }, { headers });
            }
            console.log(`[Bot ${botNum}] ✅ Kanal ${channelId} -> Başarılı`);
        } catch (err) {
            if (err.response?.status === 429) {
                console.error(`[Bot ${botNum}] ⚠️ Rate Limit (Hız Sınırı)!`);
            } else {
                console.error(`[Bot ${botNum}] ❌ Hata: ${err.response?.status}`);
            }
        }
        // Kanallar arası bekleme 100ms
        await new Promise(r => setTimeout(r, 100));
    }
}
