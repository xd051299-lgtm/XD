const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("20 Kanallı Senkronize Bot Sistemi Aktif!");
  res.send("Bot Sistemi: 8 Saniye Döngü Modu Aktif.");
});

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor.`);
  console.log(`Sunucu ${PORT} portunda aktif.`);
});

// Render Environment Variables
const tokensRaw = process.env.TOKENS; 
const channelId = process.env.CHANNEL_ID;
const messages = [process.env.MESSAGE1, process.env.MESSAGE2];

if (!tokensRaw || !channelId || !messages[0] || !messages[1]) {
    console.error("HATA: TOKENS, CHANNEL_ID, MESSAGE1 veya MESSAGE2 eksik!");
    console.error("HATA: Değişkenler eksik! Lütfen Render panelini kontrol et.");
} else {
const tokenList = tokensRaw.split(",").map(t => t.trim());

    // Toplam döngü süresi (5 saniye)
    const cycleTime = 5000; 
    // Her bot arasındaki gecikme (5000 / 20 = 250ms)
    // Sabit Döngü: 8 Saniye
    const cycleTime = 8000; 
    // Otomatik Gecikme: 8000 / 19 = ~421ms
const staggerDelay = cycleTime / tokenList.length; 

    console.log(`${tokenList.length} bot için ${staggerDelay}ms aralıklı düzen kuruldu.`);
    console.log(`Sistem Başlatıldı: ${tokenList.length} bot, ${Math.round(staggerDelay)}ms aralıkla çalışacak.`);

tokenList.forEach((token, index) => {
        // Her botun ilk başlama zamanını kaydırıyoruz
const initialOffset = index * staggerDelay;

setTimeout(() => {
            // İlk mesajı gönder
            // İlk tetikleme
sendRequest(token, index + 1);

            // Ardından her 5 saniyede bir tekrarla
            // Periyodik döngü
setInterval(() => {
sendRequest(token, index + 1);
}, cycleTime);

            console.log(`Bot ${index + 1} kuyruğa girdi (Zamanlama: +${initialOffset}ms)`);
            console.log(`[Sıra ${index + 1}] Bot kuyruğa eklendi (+${Math.round(initialOffset)}ms)`);
}, initialOffset);
});
}
@@ -63,7 +61,7 @@ function sendRequest(token, botNum) {
})
.catch((err) => {
if (err.response?.status === 429) {
            console.error(`[Bot ${botNum}] ⚠️ Rate Limit!`);
            console.error(`[Bot ${botNum}] ⚠️ Hız sınırı (Rate Limit)!`);
} else {
console.error(`[Bot ${botNum}] ❌ Hata: ${err.response?.status}`);
}
