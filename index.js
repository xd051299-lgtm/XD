const express = require('express');
const axios = require('axios');
const app = express();
app.listen(process.env.PORT || 3000);

const tokensRaw = process.env.TOKENS;
const channelId = process.env.CHANNEL_ID;
const msg1 = process.env.MESSAGE1;

const tokenList = tokensRaw.split(",").map(t => t.trim()).filter(t => t.length > 0);

// DÖNGÜ: 3 saniye (Eğer proxy yoksa daha altı intihardır)
const cycleTime = 3000; 

tokenList.forEach((token, index) => {
    // Botları 200ms arayla çok sıkışık başlatıyoruz
    setTimeout(() => {
        runInfiniteLoop(token, index + 1);
    }, index * 200);
});

async function runInfiniteLoop(token, botNum) {
    while (true) {
        try {
            await axios.post(
                `https://discord.com/api/v9/channels/${channelId}/messages`,
                { content: msg1 },
                { headers: { 'Authorization': token, 'Content-Type': 'application/json' } }
            );
            console.log(`[Bot ${botNum}] ✅ Mesaj Çakıldı!`);
            
            // Başarılı gönderimden sonra bekleme
            await new Promise(resolve => setTimeout(resolve, cycleTime));
            
        } catch (err) {
            if (err.response?.status === 429) {
                const retryAfter = (err.response.data.retry_after * 1000) || 5000;
                console.error(`[Bot ${botNum}] ⛔ Limit! ${retryAfter}ms bekleniyor...`);
                // Discord ne kadar bekle dediyse, milisaniyesi milisaniyesine bekle ve devam et
                await new Promise(resolve => setTimeout(resolve, retryAfter));
            } else {
                // Diğer hatalarda 2 saniye bekle ve tekrar dene
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
    }
}
