/* Direct Ollama Cloud API: no Ollama installation or local model download. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const endpoint = 'https://ollama.com/api/chat';
const defaultModel = 'gemma4:31b';
const allowedKeys = ['OLLAMA_API_KEY', 'OLLAMA_MODEL'];
function loadConfig(root, environment = process.env) {
  const values = {};
  const file = path.join(root, '.env');
  if (fs.existsSync(file)) {
    const source = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
    for (const line of source.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
      if (!match || !allowedKeys.includes(match[1])) continue;
      let value = match[2];
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      )
        value = value.slice(1, -1);
      values[match[1]] = value;
    }
  }
  for (const key of allowedKeys) if (environment[key] !== undefined) values[key] = environment[key];
  return { apiKey: values.OLLAMA_API_KEY || '', model: values.OLLAMA_MODEL || defaultModel };
}
function configured(config) {
  return (
    typeof config.apiKey === 'string' &&
    !!config.apiKey.trim() &&
    !/[\r\n]/.test(config.apiKey) &&
    typeof config.model === 'string' &&
    /^[a-zA-Z0-9][a-zA-Z0-9._:/-]{0,199}$/.test(config.model)
  );
}
function buildRequest(config, context, request) {
  if (!configured(config)) throw new Error('Ollama Cloud is not configured');
  return {
    // A browser can never replace the destination, model or system instructions.
    url: endpoint,
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + config.apiKey },
    body: {
      model: config.model,
      messages: [{ role: 'system', content: context.instructions }].concat(request.history, {
        role: 'user',
        content: request.message,
      }),
      stream: false,
      options: { num_predict: 4096 },
    },
  };
}
function readAnswer(payload) {
  // Never expose message.thinking, provider diagnostics, or a truncated cooking answer.
  if (payload.error || payload.done_reason === 'length') return '';
  return payload.message?.content;
}
async function generate(config, context, request, signal, fetcher = fetch) {
  const api = buildRequest(config, context, request);
  const response = await fetcher(api.url, {
    method: 'POST',
    headers: api.headers,
    body: JSON.stringify(api.body),
    signal,
    redirect: 'error',
  });
  if (!response.ok) throw new Error('Ollama Cloud unavailable');
  const answer = readAnswer(await response.json());
  if (typeof answer !== 'string' || !answer.trim())
    throw new Error('Ollama Cloud returned no complete answer');
  return answer.trim();
}
module.exports = {
  loadConfig,
  configured,
  buildRequest,
  readAnswer,
  generate,
  endpoint,
  defaultModel,
};
