#!/usr/bin/env node
/**
 * 从项目根 .env 读取 MCP 相关变量，生成 .cursor/mcp.json（供 Cursor 直接使用，无需每次 source .env）。
 * 用法：在项目根目录执行 node scripts/sync-mcp-from-env.js 或 ./sync-mcp-from-env.sh
 * 修改 .env 后运行一次即可，之后正常打开 Cursor。
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ENV_PATH = path.join(ROOT, '.env');
const TEMPLATE_PATH = path.join(ROOT, '.cursor', 'mcp.json.template');
const OUT_PATH = path.join(ROOT, '.cursor', 'mcp.json');

function parseEnv(content) {
  const vars = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    vars[key] = val;
  }
  return vars;
}

function escapeJson(s) {
  if (s == null) return '';
  return String(s)
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');
}

const vars = [
  'GITHUB_PERSONAL_ACCESS_TOKEN',
  'CONTEXT7_API_KEY',
  'N8N_API_URL',
  'N8N_API_KEY',
];

if (!fs.existsSync(ENV_PATH)) {
  console.error('未找到 .env，请先复制 .env.example 为 .env 并填写密钥。');
  process.exit(1);
}
if (!fs.existsSync(TEMPLATE_PATH)) {
  console.error('未找到 .cursor/mcp.json.template');
  process.exit(1);
}

const envContent = fs.readFileSync(ENV_PATH, 'utf8');
const env = parseEnv(envContent);
let template = fs.readFileSync(TEMPLATE_PATH, 'utf8');

for (const key of vars) {
  const value = env[key] != null ? env[key] : '';
  const placeholder = `__${key}__`;
  template = template.split(placeholder).join(escapeJson(value));
}

fs.writeFileSync(OUT_PATH, template, 'utf8');
console.log('已生成 .cursor/mcp.json，可直接打开 Cursor。');
