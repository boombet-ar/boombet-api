const pLimit = require('p-limit').default;

const MAX_CONCURRENT_FORKS = 3;  //podria ser env?

const limit = pLimit(MAX_CONCURRENT_FORKS);

module.exports = limit;
