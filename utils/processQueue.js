// Asegúrate de haber hecho: npm install p-limit@3
const pLimit = require('p-limit'); 

// Usa variable de entorno o 3 por defecto
const MAX_CONCURRENT_FORKS = parseInt(process.env.MAX_CONCURRENT_FORKS) || 3;

const limit = pLimit(MAX_CONCURRENT_FORKS);

module.exports = limit;