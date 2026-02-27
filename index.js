const express = require('express');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("8 Hesaplı Senkronize Bot Sistemi Aktif! (5 Saniye Döngü)");
});

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda aktif.`);
});

// Render Environment Variables
const tokensRaw = process.env.TOKENS; 
const channelId = process.env.CHANNEL_ID;
const msg1 = process.env.MESSAGE1;
const msg2 = process.env.MESSAGE2;

if (!tokensRaw || !channelId || !msg1) {
    console.error("HATA: Değişkenler eksik! Render panelini kontrol et.");
} else {
    const tokenList = tokensRaw.split(",").map(t => t.trim()).filter(t => t.length > 0);
    
    // İstediğin Ayar: Toplam döngü süresi 5 saniye (5000ms)
    const cycleTime = 5000; 
    // 8 hesap için her bot arası gecikme: 5000 / 8 = 625ms
    const staggerDelay = cycleTime / tokenList.length; 

    console.log(`${tokenList.length} bot için ${Math.round(staggerDelay)}ms aralıklı düzen kuruldu.`);

    tokenList.forEach((token, index) => {
        const initialOffset = index * staggerDelay;

        setTimeout(() => {
            // İlk tetikleme
            sendRequest(token, index + 1);

            // Periyodik döngü (Her 5 saniyede bir)
            setInterval(() => {
                sendRequest(token, index + 1);
            }, cycleTime);

            console.log(`[Bot ${index + 1}] Döngüye girdi (+${Math.round(initialOffset)}ms gecikmeyle)`);
        }, initialOffset);
    });
}

async function sendRequest(token, botNum) {
    const url = `https://discord.com/api/v9/channels/${channelId.trim()}/messages`;
    // Mesaj 1 ve Mesaj 2 arasında rastgele seçim yapabilir veya msg1 kullanabilirsin
    const content = msg2 ? (Math.random() > 0.5 ? msg1 : msg2) : msg1;

    try {
        await axios.post(url, 
            { content: content }, 
            { headers: { 'Authorization': token.trim(), 'Content-Type': 'application/json' } }
        );
        console.log(`[Bot ${botNum}] ✅ Mesaj Gönderildi`);
    } catch (err) {
        if (err.response?.status === 429) {
            console.error(`[Bot ${botNum}] ⚠️ Rate Limit (Hız Sınırı)!`);
        } else {
            console.error(`[Bot ${botNum}] ❌ Hata: ${err.response?.status}`);
        }
    }
}
