
const fs = require('fs');
const path = require('path');

const MEMORY_FILE = path.join(__dirname, 'user_memory.json');

// Charger la mémoire existante
function loadMemory() {
  try {
    if (fs.existsSync(MEMORY_FILE)) {
      const data = fs.readFileSync(MEMORY_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('❌ Erreur lecture mémoire:', error.message);
  }
  return {};
}

// Sauvegarder la mémoire
function saveMemory(memory) {
  try {
    fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2));
  } catch (error) {
    console.error('❌ Erreur sauvegarde mémoire:', error.message);
  }
}

// Obtenir le contexte d'un utilisateur
function getUserContext(userId) {
  const memory = loadMemory();
  return memory[userId] || { name: null, conversations: [], lastSeen: null };
}

// Mettre à jour le contexte d'un utilisateur
function updateUserContext(userId, newInfo) {
  const memory = loadMemory();
  if (!memory[userId]) {
    memory[userId] = { name: null, conversations: [], lastSeen: null };
  }
  
  // Mettre à jour les infos
  Object.assign(memory[userId], newInfo);
  memory[userId].lastSeen = new Date().toISOString();
  
  // Garder seulement les 10 dernières conversations
  if (memory[userId].conversations.length > 10) {
    memory[userId].conversations = memory[userId].conversations.slice(-10);
  }
  
  saveMemory(memory);
}

// Extraire le nom d'un message
function extractName(message) {
  const namePatterns = [
    /je m'appelle\s+(\w+)/i,
    /mon nom c'est\s+(\w+)/i,
    /c'est\s+(\w+)/i,
    /moi c'est\s+(\w+)/i
  ];
  
  for (const pattern of namePatterns) {
    const match = message.match(pattern);
    if (match) return match[1];
  }
  return null;
}

module.exports = {
  getUserContext,
  updateUserContext,
  extractName
};
