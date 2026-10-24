import { cp, mkdir } from 'node:fs/promises';
await mkdir('dist', { recursive: true });
for (const file of ['index.html', 'src', 'assets']) await cp(file, `dist/${file}`, { recursive: true });
console.log('Build complete: dist/ (static files, no runtime dependencies)');
