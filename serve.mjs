// Launcher that pins the working directory to this folder before starting Vite.
// Tailwind resolves its `content` globs against process.cwd(), so starting the
// server from anywhere else silently produces a stylesheet with no utilities.
import path from 'node:path';
import { fileURLToPath } from 'node:url';

process.chdir(path.dirname(fileURLToPath(import.meta.url)));

const { createServer } = await import('vite');
const server = await createServer({ server: { port: 4300, host: true } });
await server.listen();
server.printUrls();
