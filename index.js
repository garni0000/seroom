require('dotenv').config();
const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const input = require('input');
const fs = require('fs');
const { OpenAI } = require('openai');

// Initialisation AI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Configuration Telegram
const apiId = 21274785; // Ton API_ID
const apiHash = '7aed9b9a867a8dd5f4b8678ef406ed84'; // Ton API_HASH
const stringSession = new StringSession('1AQAOMTQ5LjE1NC4xNzUuNTMBu3sC1/IU0n0nVYSn5RttfkeXM3Q8W/l7SRyjqSv3oC9GrG6+0eNqUysuIwofqkuDgem5OtQc90qh/P/3QtXOh+f2hmJ5tBd1FQkhnAUAJA0Y+Do+Q5kmV26CgWDMszxv98Lp6lF0E6EU0dD2lyaggg1nDyrS6jEp5eWdLpbgolZ4n/IdNhwcOskvDCNlQNmo5T+Ef1XPmHSSN1CdyO0qwVpJgt3qZG+RzgvguiJB0YXZlmYNspGQ8Gf3rozL7CeKnLMC6/ZWHT2Slos4R0aHVfJm5jx6pi0wWzoxajGxbquN5t8T5pMK4LgTgNq5m4F2nz0i1sK1HgxrBfSxqflEr8s'); // Mets ici ton StringSession une fois connecté

const memory = JSON.parse(fs.readFileSync('memory.json', 'utf-8'));
const promptBase = fs.readFileSync('prompt.txt', 'utf-8');

const client = new TelegramClient(stringSession, apiId, apiHash, {
  connectionRetries: 5,
});

(async () => {
  console.log('Lancement...');
  await client.start({
    phoneNumber: async () => await input.text('Numéro: '),
    password: async () => await input.text('2FA Password: '),
    phoneCode: async () => await input.text('Code: '),
    onError: (err) => console.log(err),
  });

  console.log('Connecté !');
  console.log(client.session.save()); // À copier pour éviter de se reconnecter

  client.addEventHandler(async (update) => {
    const message = update.message;
    if (!message || !message.message || !message.peerId || message.out) return;

    const userId = message.senderId.userId;
    const username = (await client.getEntity(userId)).username || 'Inconnu';
    const text = message.message;

    const history = memory[userId] || [];
    history.push({ role: 'user', content: text });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: promptBase },
        ...history.slice(-10),
      ],
    });

    const reply = response.choices[0].message.content;
    await client.sendMessage(message.peerId, { message: reply });

    history.push({ role: 'assistant', content: reply });
    memory[userId] = history;
    fs.writeFileSync('memory.json', JSON.stringify(memory, null, 2));
  }, 'updateNewMessage');
})();
