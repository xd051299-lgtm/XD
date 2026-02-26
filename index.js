const { Client } = require('discord.js-selfbot-v13');

const tokens = process.env.TOKENS ? process.env.TOKENS.split(',') : [];
const channelIds = process.env.CHANNEL_IDS ? process.env.CHANNEL_IDS.split(',') : [];
const messages = [process.env.MESSAGE1, process.env.MESSAGE2].filter(msg => msg);

tokens.forEach((token, index) => {
    const client = new Client({ checkUpdate: false });

    client.on('ready', async () => {
        console.log(`[GİRİŞ YAPILDI] ${client.user.tag}`);
        
        for (const channelId of channelIds) {
            try {
                const channel = await client.channels.fetch(channelId.trim());
                for (const msg of messages) {
                    await channel.send(msg);
                    console.log(`[MESAJ] ${client.user.tag} -> ${channelId}`);
                }
            } catch (err) {
                console.error(`[HATA] ${channelId} kanalına gönderilemedi.`);
            }
        }
    });

    client.login(token.trim()).catch(() => console.error(`Token ${index + 1} Hatalı!`));
});
