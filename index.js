const express = require('express');
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hız Modu: 2 Saniye Döngü Aktif...");
});

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});

const tokens = process.env.TOKENS ? process.env.TOKENS.split(",") : [];
const message = process.env.MESSAGE;
const channelIds = process.env.CHANNEL_IDS ? process.env.CHANNEL_IDS.split(",") : [];

let currentTokenIndex = 0;
let currentChannelIndex = 0;

// 10 token için toplam 2 saniye (2000ms / 10 = 200ms)
const delayBetweenAccounts = 200; 

if (tokens.length === 0 || channelIds.length === 0 || !message) {
    console.error("HATA: Bilgiler eksik!");
} else {
    console.log("🚀 Işık hızı modu başlatıldı. Dikkatli ol!");
    runSequence();
}

async function runSequence() {
    const token = tokens[currentTokenIndex].trim();
    const channel = channelIds[currentChannelIndex].trim();

    // İstek gönderiliyor (Hız için 'then/catch' yapısı kullanıldı)
    axios.post(`https://discord.com/api/v9/channels/${channel}/messages`, {
        content: message
    }, {
        headers: {
            "Authorization": token,
            "Content-Type": "application/json"
        }
    }).then(() => {
        console.log(`✅ [Token ${currentTokenIndex + 1}] -> Gönderildi.`);
    }).catch((err) => {
        if (err.response?.status === 429) {
            console.warn(`⚠️ [Token ${currentTokenIndex + 1}] LİMİT!`);
        } else if (err.response?.status === 401) {
            console.error(`❌ [Token ${currentTokenIndex + 1}] YETKİ HATASI (401)!`);
        }
    });

    // Sıralama mantığı
    currentChannelIndex = (currentChannelIndex + 1) % channelIds.length;
    currentTokenIndex = (currentTokenIndex + 1) % tokens.length;

    // 200ms sonra sıradaki tokene geç
    setTimeout(runSequence, delayBetweenAccounts);
}
