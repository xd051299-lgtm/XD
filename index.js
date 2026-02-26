const express = require('express');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("9 Hesaplı Senkronize Bot Sistemi Aktif! (3 Saniye Döngü)");
});

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});

// Render Environment Variables
const tokensRaw = process.env.TOKENS; 
const channelId = process.env.CHANNEL_ID;
const message1 = process.env.MESSAGE1;
const message2 = process.env.MESSAGE2;

if (!tokensRaw || !channelId || !message1) {
    console.error("HATA: Değişkenler eksik! Render panelini kontrol et.");
} else {
    const tokenList = tokensRaw.split(",").map(t => t.trim());
    
    // İsteğin: 3 saniye toplam döngü süresi
    const cycleTime = 3000; 
    const staggerDelay = cycleTime / tokenList.length; // 9 hesap için ~333ms

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

            console.log(`[Sıra ${index + 1}] Bot aktif edildi (+${Math.round(initialOffset)}ms)`);
        }, initialOffset);
    });
}

async function sendRequest(token, botNum) {
    const url = `https://discord.com/api/v9/channels/${channelId.trim()}/messages`;
    
    // Rastgele mesaj seçimi veya sırayla gönderim
    const content = Math.random() > 0.5 ? message1 : (message2 || message1);

    try {
        await axios.post(url, { content: content }, {
            headers: { 'Authorization': token.trim() }
        });
        console.log(`[Bot ${botNum}] ✅ Mesaj Gönderildi`);
    } catch (err) {
        if (err.response?.status === 429) {
            console.error(`[Bot ${botNum}] ⚠️ Rate Limit!`);
        } else if (err.response?.status === 401) {
            console.error(`[Bot ${botNum}] ❌ Yetkisiz: Token geçersiz!`);
        } else {
            console.error(`[Bot ${botNum}] ❌ Hata: ${err.response?.status}`);
        }
    }
}
