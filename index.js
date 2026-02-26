const { Client, GatewayIntentBits } = require('discord.js');

// Render Environment Variables okuma
const tokens = process.env.TOKENS ? process.env.TOKENS.split(',') : [];
const channelIds = process.env.CHANNEL_IDS ? process.env.CHANNEL_IDS.split(',') : [];
const messages = [process.env.MESSAGE1, process.env.MESSAGE2].filter(msg => msg);

if (tokens.length === 0) {
    console.error("HATA: TOKENS boş bırakılamaz!");
    process.exit(1);
}

// Her token için ayrı bir işlem başlatır
tokens.forEach((token, index) => {
    const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

    client.once('ready', async () => {
        console.log(`Token ${index + 1} aktif: ${client.user.tag}`);

        // Belirlenen kanallara mesajları gönderir
        for (const channelId of channelIds) {
            try {
                const channel = await client.channels.fetch(channelId.trim());
                if (channel) {
                    for (const msg of messages) {
                        await channel.send(msg);
                        console.log(`[BAŞARILI] ${client.user.tag} -> Kanal: ${channelId}`);
                    }
                }
            } catch (err) {
                console.error(`[HATA] ${client.user.tag} Mesaj gönderemedi: ${err.message}`);
            }
        }
    });

    client.login(token.trim()).catch(err => {
        console.error(`[GİRİŞ HATASI] Token ${index + 1} geçersiz: ${err.message}`);
    });
});
