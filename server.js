'use strict';
const server = require('./server/http');
if (require.main === module) server.main();
module.exports = server;
