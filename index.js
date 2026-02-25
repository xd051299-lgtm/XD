const express = require('express');
const axios = require("axios");
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("50 WPM Modu Aktif: Hatalar Giderildi, Sistem Çalışıyor!");
});

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda aktif.`);
});

const TOKEN = process.env.TOKEN; 
const CHANNEL_IDS = process.env.CHANNEL_IDS;
const MESSAGE = process.env.MESSAGE;

if (!TOKEN || !CHANNEL_IDS || !MESSAGE) {
    console.error("HATA: Değişkenler eksik! Render panelini kontrol et.");
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

                    // 2. 50 WPM HESABI: Harf başına 240ms bekleme
                    const typingTime = MESSAGE.length * 240;
                    console.log(`[${channelId}] Yazılıyor... Bekleme süresi: ${Math.round(typingTime/1000)} saniye.`);
                    
                    await new Promise(resolve => setTimeout(resolve, typingTime));

                    // 3. Mesajı Gönder
                    await axios.post(
                        `https://discord.com/api/v9/channels/${channelId}/messages`,
                        { content: MESSAGE },
                        { headers: { "Authorization": TOKEN } }
                    );
                    console.log(`[${channelId}] ✅ Mesaj başarıyla atıldı.`);

                    // 4. Kanal geçiş aralığı (Hata düzeltildi: Parantez eklendi)
                    await new Promise(resolve => setTimeout(resolve, 500));

                } catch (err) {
                    console.error(`[${channelId}] ❌ Hata: ${err.response?.status || "Bağlantı"}. 5sn sonra devam...`);
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }
            }
            console.log("Liste tamamlandı, başa dönülüyor...");
        }
    }
    startProcess();
}
