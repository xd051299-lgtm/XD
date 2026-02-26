const { Client } = require('discord.js-selfbot-v13');

const tokens = process.env.TOKENS ? process.env.TOKENS.split(',') : [];
const channelIds = process.env.CHANNEL_IDS ? process.env.CHANNEL_IDS.split(',') : [];
const message1 = process.env.MESSAGE1;
const message2 = process.env.MESSAGE2;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

tokens.forEach((token, index) => {
    const client = new Client({ checkUpdate: false });

    client.on('ready', async () => {
        console.log(`[GİRİŞ] Hesap ${index + 1}: ${client.user.tag}`);
        
        // İlk token 0sn, sonrakiler 0.238, 0.378 gibi rastgele gecikmelerle başlar
        const initialDelay = index === 0 ? 0 : Math.floor(Math.random() * (450 - 200) + 200);
        await sleep(initialDelay);

        for (const id of channelIds) {
            try {
                const channel = await client.channels.fetch(id.trim());
                if (channel) {
                    // Mesajları gönder
                    if (message1) await channel.send(message1);
                    if (message2) await channel.send(message2);
                    console.log(`[GÖNDERİLDİ] ${client.user.tag} -> Kanal: ${id.trim()} (${initialDelay}ms gecikme ile)`);
                }
            } catch (err) {
                console.error(`[HATA] ${client.user.tag} gönderim yapamadı.`);
            }
        }
    });

    client.login(token.trim()).catch(() => {
        console.error(`[TOKEN HATASI] Token ${index + 1} geçersiz!`);
    });
});
