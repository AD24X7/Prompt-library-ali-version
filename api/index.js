const serverless = require('serverless-http');
const appModule = require('../backend/app');
const connectDatabase = appModule.connectDatabase;

let handler;
let ready = false;

async function init() {
  if (ready) return;
  try {
    if (connectDatabase) await connectDatabase();
  } catch (e) {
    console.error('Failed to connect database in serverless init', e);
  }
  handler = serverless(appModule);
  ready = true;
}

module.exports = async (req, res) => {
  if (!ready) await init();
  return handler(req, res);
};
