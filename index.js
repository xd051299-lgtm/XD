const express = require('express');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("9 Hesap / Çift Mesaj Modu Aktif!");
});

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda aktif.`);
});

// Değişkenleri Temizle
const tokensRaw = process.env.TOKENS; 
const channelId = process.env.CHANNEL_ID ? process.env.CHANNEL_ID.trim() : null;
const msg1 = process.env.MESSAGE1;
const msg2 = process.env.MESSAGE2;

if (!tokensRaw || !channelId || !msg1) {
    console.error("HATA: Değişkenler (TOKEN, CHANNEL_ID veya MESSAGE1) eksik!");
} else {
    const tokenList = tokensRaw.split(",").map(t => t.trim()).filter(t => t.length > 0);
    const cycleTime = 3000; // Toplam 3 saniye
    const staggerDelay = cycleTime / tokenList.length;

    console.log(`${tokenList.length} bot başlatılıyor. Her bot ${Math.round(staggerDelay)}ms arayla devreye girecek.`);

    tokenList.forEach((token, index) => {
        const initialOffset = index * staggerDelay;

        setTimeout(() => {
            // İlk tetikleme (Önce Mesaj 1, sonra Mesaj 2)
            sendDualMessages(token, index + 1);

            // Periyodik döngü
            setInterval(() => {
                sendDualMessages(token, index + 1);
            }, cycleTime);

            console.log(`[Bot ${index + 1}] Çift mesaj döngüsü başladı.`);
        }, initialOffset);
    });
}

async function sendDualMessages(token, botNum) {
    const url = `https://discord.com/api/v9/channels/${channelId}/messages`;
    const headers = { 'Authorization': token, 'Content-Type': 'application/json' };

    try {
        // Mesaj 1 Gönderimi
        await axios.post(url, { content: msg1.toString() }, { headers });
        console.log(`[Bot ${botNum}] ✅ Mesaj 1 gönderildi.`);

        // Mesaj 2 varsa, çok kısa bir bekleme (100ms) sonrası gönder
        if (msg2) {
            await new Promise(resolve => setTimeout(resolve, 100));
            await axios.post(url, { content: msg2.toString() }, { headers });
            console.log(`[Bot ${botNum}] ✅ Mesaj 2 gönderildi.`);
        }
    } catch (err) {
        console.error(`[Bot ${botNum}] ❌ Hata: ${err.response?.status || "Bağlantı Sorunu"}`);
    }
}
