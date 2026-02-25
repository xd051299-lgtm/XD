const express = require('express');
const axios = require("axios");
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("50 WPM Gerçekçi Yazma Modu Aktif!");
});

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda aktif.`);
});

const TOKEN = process.env.TOKEN; 
const CHANNEL_IDS = process.env.CHANNEL_IDS;
const MESSAGE = process.env.MESSAGE;

if (!TOKEN || !CHANNEL_IDS || !MESSAGE) {
    console.error("HATA: Değişkenler eksik!");
} else {
    const channelList = CHANNEL_IDS.split(",").map(c => c.trim());
    
    async function startProcess() {
        while (true) { 
            for (const channelId of channelList) {
                try {
                    // 1. "Yazıyor..." animasyonu
                    await axios.post(
                        `https://discord.com/api/v9/channels/${channelId}/typing`,
                        {},
                        { headers: { "Authorization": TOKEN } }
                    );

                    // 2. 50 WPM HESABI: (Harf Sayısı * 240ms)
                    // 50 WPM hızı, karakter başına yaklaşık 240 milisaniyeye denk gelir.
                    const typingTime = MESSAGE.length * 240;
                    console.log(`[${channelId}] ${MESSAGE.length} harf için ${Math.round(typingTime/1000)}sn yazılıyor...`);
                    
                    await new Promise(resolve => setTimeout(resolve, typingTime));

                    // 3. Mesajı Gönder
                    await axios.post(
                        `https://discord.com/api/v9/channels/${channelId}/messages`,
                        { content: MESSAGE },
                        { headers: { "Authorization": TOKEN } }
                    );
                    console.log(`[${channelId}] ✅ Mesaj Atıldı.`);

                    // Kanallar arası geçişte çok kısa (0.5sn) bekleme (Discord güvenliği için)
                    await new Promise(resolve => setTimeout(resolve, 500);

                } catch (err) {
                    console.error(`[${channelId}] Hata! 5sn sonra devam...`);
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }
            }
        }
    }
    startProcess();
}
