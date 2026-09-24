#!/usr/bin/env node
// Lock / unlock the written-exams question banks.
//
//   node tools/exam-vault.mjs lock     encrypt data + figs into #vault, encrypt image files
//   node tools/exam-vault.mjs unlock   restore plaintext (to edit or run add_course.py)
//   node tools/exam-vault.mjs status
//
// Password comes from $EXAM_PASSWORD or a prompt. The salt is kept across unlock/lock so
// devices that chose "Remember on this device" stay unlocked after a re-lock with the
// same password. Format must match the loader at the bottom of written-exams.html.
import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { webcrypto as C } from 'node:crypto';
import { createInterface } from 'node:readline';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const HTML = join(ROOT, 'written-exams.html');
const ITER = 310000;
const b64 = u => Buffer.from(u).toString('base64');
const unb64 = s => new Uint8Array(Buffer.from(s, 'base64'));

const RX = {
  data: /(<script id="data" type="application\/json">)([\s\S]*?)(<\/script>)/,
  figs: /(<script id="figs" type="application\/json">)([\s\S]*?)(<\/script>)/,
  vault: /(<script id="vault" type="application\/json"(?: data-salt="([^"]*)")?>)([\s\S]*?)(<\/script>)/,
};

function part(html, rx) { const m = html.match(rx); if (!m) throw new Error('missing block ' + rx); return m; }

async function password() {
  if (process.env.EXAM_PASSWORD) return process.env.EXAM_PASSWORD;
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const pw = await new Promise(r => rl.question('Password: ', r)); rl.close();
  if (!pw) throw new Error('empty password');
  return pw;
}

async function keyFor(pw, salt) {
  const base = await C.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveKey']);
  return C.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: ITER, hash: 'SHA-256' }, base,
    { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

async function enc(key, bytes) {
  const iv = C.getRandomValues(new Uint8Array(12));
  return { iv, ct: new Uint8Array(await C.subtle.encrypt({ name: 'AES-GCM', iv }, key, bytes)) };
}

async function lock() {
  let html = readFileSync(HTML, 'utf8');
  const v = part(html, RX.vault);
  if (v[3].trim()) { console.log('already locked'); return; }
  const data = part(html, RX.data)[2], figsText = part(html, RX.figs)[2];
  if (!data.trim()) throw new Error('no plaintext data to lock');
  const pw = await password();
  const salt = v[2] ? unb64(v[2]) : C.getRandomValues(new Uint8Array(16));
  const key = await keyFor(pw, salt);

  const figs = JSON.parse(figsText);
  let files = 0;
  for (const [k, val] of Object.entries(figs)) {
    if (val.startsWith('data:') || val.startsWith('enc:')) continue;
    const src = join(ROOT, val);
    const { iv, ct } = await enc(key, readFileSync(src));
    writeFileSync(src + '.enc', Buffer.concat([iv, ct]));
    unlinkSync(src);
    figs[k] = 'enc:' + val + '.enc';
    files++;
  }
  const payload = JSON.stringify({ data, figs: JSON.stringify(figs) });
  const { iv, ct } = await enc(key, new TextEncoder().encode(payload));
  const env = JSON.stringify({ v: 1, iter: ITER, salt: b64(salt), iv: b64(iv), ct: b64(ct) });

  html = html.replace(RX.data, '$1$3').replace(RX.figs, '$1$3')
    .replace(RX.vault, () => `<script id="vault" type="application/json">${env}</script>`);
  writeFileSync(HTML, html);
  console.log(`locked: bank ${(payload.length / 1e6).toFixed(1)} MB encrypted, ${files} image files encrypted`);
}

async function unlock() {
  let html = readFileSync(HTML, 'utf8');
  const v = part(html, RX.vault);
  if (!v[3].trim()) { console.log('already unlocked'); return; }
  const env = JSON.parse(v[3]);
  const pw = await password();
  const key = await keyFor(pw, unb64(env.salt));
  let pt;
  try { pt = await C.subtle.decrypt({ name: 'AES-GCM', iv: unb64(env.iv) }, key, unb64(env.ct)); }
  catch { throw new Error('wrong password'); }
  const o = JSON.parse(new TextDecoder().decode(pt));
  const figs = JSON.parse(o.figs);
  let files = 0;
  for (const [k, val] of Object.entries(figs)) {
    if (!val.startsWith('enc:')) continue;
    const path = val.slice(4), src = join(ROOT, path);
    const buf = readFileSync(src);
    const plain = await C.subtle.decrypt({ name: 'AES-GCM', iv: buf.subarray(0, 12) }, key, buf.subarray(12));
    const out = path.replace(/\.enc$/, '');
    writeFileSync(join(ROOT, out), Buffer.from(plain));
    unlinkSync(src);
    figs[k] = out;
    files++;
  }
  const safe = s => s.replace(/<\//g, '<\\/');
  html = html.replace(RX.data, (_, a, __, c) => a + o.data + c)
    .replace(RX.figs, (_, a, __, c) => a + safe(JSON.stringify(figs)) + c)
    .replace(RX.vault, () => `<script id="vault" type="application/json" data-salt="${env.salt}"></script>`);
  writeFileSync(HTML, html);
  console.log(`unlocked: plaintext restored, ${files} image files decrypted. Lock again before committing.`);
}

function status() {
  const html = readFileSync(HTML, 'utf8');
  console.log(part(html, RX.vault)[3].trim() ? 'locked' : 'UNLOCKED (plaintext)');
}

const cmd = process.argv[2];
const fn = { lock, unlock, status }[cmd];
if (!fn) { console.log('usage: exam-vault.mjs lock|unlock|status'); process.exit(2); }
Promise.resolve().then(fn).catch(e => { console.error('error:', e.message); process.exit(1); });
