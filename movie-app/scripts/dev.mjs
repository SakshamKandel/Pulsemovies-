import { spawn } from 'node:child_process';

const children = [];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill();
  process.exitCode = code;
}
// Start the isolated proxy before Next. A port conflict stops this run rather
// than quietly sending player HTML to an unrelated service.
const proxy = spawn(process.execPath, ['--max-old-space-size=128', 'scripts/embed-proxy.mjs'], { stdio: ['ignore', 'pipe', 'inherit'] });
children.push(proxy);
let started = false;
proxy.stdout.on('data', data => {
  process.stdout.write(data);
  if (started || !data.toString().includes('Embed proxy:')) return;
  started = true;
  const next = spawn(process.execPath, ['--max-old-space-size=1536', 'node_modules/next/dist/bin/next', 'dev', '--webpack', ...process.argv.slice(2)], { stdio: 'inherit' });
  children.push(next);
  next.on('exit', code => stop(code || 0));
  next.on('error', () => stop(1));
});
proxy.on('exit', code => stop(code || 0));
proxy.on('error', () => stop(1));
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
