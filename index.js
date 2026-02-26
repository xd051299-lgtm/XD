const express = require('express');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("İstanbul Saat Damgalı Sistem Aktif!");
});

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda aktif.`);
});

const tokensRaw = process.env.TOKENS; 
const channelsRaw = process.env.CHANNEL_IDS; 
const msg1 = process.env.MESSAGE1;
const msg2 = process.env.MESSAGE2;

// İstanbul saatini (SS:DD:ss) formatında alan fonksiyon
function getIstanbulTime() {
  return new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(new Date());
}

// Mesajın sonuna sadece saat ekler (Örn: "Merhaba [12:02:56]")
function processMessage(text) {
    const timeStamp = getIstanbulTime();
    return `${text} [${timeStamp}]`;
}

if (!tokensRaw || !channelsRaw || !msg1) {
    console.error("HATA: Değişkenler eksik!");
} else {
    const tokenList = tokensRaw.split(",").map(t => t.trim()).filter(t => t.length > 0);
    const channelList = channelsRaw.split(",").map(c => c.trim()).filter(c => c.length > 0);
    
    const cycleTime = 3000; // 3 Saniye
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

async function sendToAllChannels(token, botNum, channelList) {
    const headers = { 'Authorization': token, 'Content-Type': 'application/json' };

    for (const channelId of channelList) {
        const url = `https://discord.com/api/v9/channels/${channelId}/messages`;
        
        try {
            // Mesaj 1
            await axios.post(url, { content: processMessage(msg1) }, { headers });
            
            if (msg2) {
                await new Promise(r => setTimeout(r, 250)); // İki mesaj arası kısa bekleme
                // Mesaj 2
                await axios.post(url, { content: processMessage(msg2) }, { headers });
            }
            console.log(`[Bot ${botNum}] ✅ Kanal ${channelId} (Saat: ${getIstanbulTime()})`);
        } catch (err) {
            if (err.response?.status === 429) {
                console.error(`[Bot ${botNum}] ⚠️ Hız Sınırı!`);
            } else {
                console.error(`[Bot ${botNum}] ❌ Hata: ${err.response?.status}`);
            }
        }
        await new Promise(r => setTimeout(r, 200)); // Kanallar arası kısa bekleme
    }
}
