const express = require('express');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Anti-Spam %50 Modu Aktif!");
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
    
    const cycleTime = 3000; 
    const staggerDelay = cycleTime / tokenList.length;

    tokenList.forEach((token, index) => {
        const initialOffset = index * staggerDelay;

        setTimeout(() => {
            sendToAllChannels(token, index + 1, channelList);

            setInterval(() => {
                sendToAllChannels(token, index + 1, channelList);
            }, cycleTime);
        }, initialOffset);
    });
}

// Mesajı %50 ihtimalle değiştirir
function processMessage(text) {
    // Math.random() 0 ile 1 arası değer verir. 0.5'ten küçükse değiştirir.
    if (Math.random() < 0.5) {
        const randomID = Math.random().toString(36).substring(2, 6);
        return `${text} .${randomID}`;
    }
    return text; // %50 ihtimalle orijinal hali
}

async function sendToAllChannels(token, botNum, channelList) {
    const headers = { 'Authorization': token, 'Content-Type': 'application/json' };

    for (const channelId of channelList) {
        const url = `https://discord.com/api/v9/channels/${channelId}/messages`;
        
        try {
            // Mesaj 1
            await axios.post(url, { content: processMessage(msg1) }, { headers });
            
            if (msg2) {
                await new Promise(r => setTimeout(r, 200)); 
                // Mesaj 2
                await axios.post(url, { content: processMessage(msg2) }, { headers });
            }
            console.log(`[Bot ${botNum}] ✅ Kanal: ${channelId}`);
        } catch (err) {
            console.error(`[Bot ${botNum}] ❌ Hata: ${err.response?.status}`);
        }
    }
}
