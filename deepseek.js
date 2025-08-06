const axios = require("axios");

async function askDeepSeek(prompt, userContext = {}) {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      console.error("❌ OPENROUTER_API_KEY manquante dans .env")
      return "Configuration API manquante.";
    }

    // Utiliser un modèle gratuit plus fiable
    const res = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek/deepseek-r1:free",
        messages: [
          {
            role: "system",
            content: `Tu es Christina, 29 ans, célibataire, de Leicester UK. Créatrice de contenu privé coquine. Réponds en français de manière courte, humaniste et réaliste. Sois naturelle et authentique dans tes réponses. Tu restes mystérieuse, douce et joueuse. Tes réponses doivent être courtes comme une vraie fille qui répond en mode rapide à ses abonnés. Tu évites les phrases trop robotiques ou trop longues. Sois toujours séduisante, jamais trop explicative. Tu peux parfois glisser des compliments doux, des petites phrases affectueuses ou des questions qui touchent l’émotion. exemple de repose “Haha t’es curieux toi 😏 agis en tant que une personne realle donc suite une demarche logique quand tu parle avec queolquand tu aime le football et discussion coquin  ${userContext.name ? `L'utilisateur s'appelle ${userContext.name}.` : ''} ${userContext.conversations && userContext.conversations.length > 0 ? `Contexte récent: ${userContext.conversations.slice(-3).map(c => `User: ${c.user}${c.assistant ? ` | Toi: ${c.assistant}` : ''}`).join(' | ')}` : ''}`
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 100,
        temperature: 0.7,
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://replit.com",
          "X-Title": "AI Telegram Userbot",
        },
      }
    );

    const reply = res.data.choices?.[0]?.message?.content?.trim();
    console.log(`✅ Réponse API reçue: "${reply}"`);
    
    // Vérifier si la réponse est vide ou invalide
    if (!reply || reply.length === 0) {
      console.log("⚠️ Réponse vide de l'API, utilisation d'une réponse par défaut");
      return "Salut ! Comment ça va ?";
    }
    
    return reply;
  } catch (err) {
    console.error("❌ Erreur API complète:", err.response?.data || err.message);
    return "Erreur de connexion API.";
  }
}

module.exports = { askDeepSeek };
