const express = require('express');
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// Render'ın uyumaması için basit bir ana sayfa
app.get("/", (req, res) => {
  res.send("Bot aktif ve kanalları geziyor...");
});

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda dinleniyor.`);
});

// Environment değişkenlerini alıyoruz
const token = process.env.TOKEN;
const message = process.env.MESSAGE;
// İstediğin gibi CHANNEL_IDS olarak güncellendi
const channelIds = process.env.CHANNEL_IDS ? process.env.CHANNEL_IDS.split(",") : [];

let currentIndex = 0;

if (!token || channelIds.length === 0 || !message) {
    console.error("HATA: TOKEN, CHANNEL_IDS veya MESSAGE eksik!");
} else {
    // 5 saniyede bir gönderim yapar (İstersen süreyi değiştirebilirsin)
    setInterval(sendMessage, 5000);
}

function sendMessage() {
  // Sıradaki kanal ID'sini al ve boşlukları temizle
  const currentChannel = channelIds[currentIndex].trim();

  axios.post(`https://discord.com/api/v9/channels/${currentChannel}/messages`, {
    content: message
  }, {
    headers: {
      "Authorization": token,
      "Content-Type": "application/json"
    }
  }).then(() => {
    console.log(`✅ [Sıra: ${currentIndex + 1}/${channelIds.length}] Kanal: ${currentChannel} -> Mesaj gönderildi.`);
  }).catch((err) => {
    console.error(`❌ Kanal: ${currentChannel} gönderim hatası:`, err.response?.status);
  });

  // Bir sonraki kanala geç, liste biterse başa dön
  currentIndex = (currentIndex + 1) % channelIds.length;
}
