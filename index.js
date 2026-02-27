const cycleTime = 15000; // 15 saniye yaptık
const staggerDelay = cycleTime / tokenList.length; // 8 bot için ~1.8 saniye aralık

// ... (diğer kısımlar aynı)

async function sendRequest(token, botNum) {
    const url = `https://discord.com/api/v9/channels/${channelId.trim()}/messages`;
    
    try {
        await axios.post(url, { content: msg1 }, {
            headers: { 'Authorization': token, 'Content-Type': 'application/json' }
        });
        console.log(`[Bot ${botNum}] ✅ Mesaj başarıyla gönderildi.`);
    } catch (err) {
        if (err.response?.status === 429) {
            // Discord'un verdiği bekleme süresini logla
            const retryAfter = err.response.data.retry_after || "biraz";
            console.error(`[Bot ${botNum}] ⚠️ Engel yedik! ${retryAfter} saniye beklemeniz lazım.`);
        } else {
            console.error(`[Bot ${botNum}] ❌ Hata kodu: ${err.response?.status}`);
        }
    }
}
