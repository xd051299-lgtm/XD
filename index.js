const { Client } = require('discord.js-selfbot-v13');
const express = require('express');
const app = express();

app.get("/", (req, res) => res.send("Sistem Aktif ve Beklemede..."));
app.listen(process.env.PORT || 10000);

const tokensRaw = process.env.TOKENS;
const channelId = process.env.CHANNEL_ID;

if (tokensRaw && channelId) {
    const tokenList = tokensRaw.split(/[\s,]+/).filter(t => t.length > 25);
    
    tokenList.forEach((token, index) => {
        // Gecikmeyi 30 saniyeye çıkardık (Aşırı önemli)
        setTimeout(() => {
            const client = new Client({ checkUpdate: false });

            client.on('ready', async () => {
                console.log(`✅ [Bot ${index + 1}] Giriş Yaptı: ${client.user.tag}`);
                try {
                    const channel = await client.channels.fetch(channelId);
                    if (channel) {
                        await client.voice.joinChannel(channel, { selfMute: true, selfDeaf: true });
                        console.log(`🔊 [Bot ${index + 1}] Sese Girdi.`);
                    }
                } catch (e) {
                    console.log(`❌ [Bot ${index + 1}] Ses Hatası.`);
                }
            });

            // Tarayıcı gibi görünerek girişi gizle
            client.login(token).catch(() => {
                console.log(`⚠️ [Bot ${index + 1}] Giriş Reddedildi! (Hesap kilitli veya IP banlı)`);
            });
        }, index * 30000); 
    });
}
