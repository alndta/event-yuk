import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = path.resolve(__dirname, '../src/modules');
const walk = (d: string): string[] =>
  fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : e.name.endsWith('.ts') ? [path.join(d, e.name)] : []));

describe('module boundaries', () => {
  it('modules import other modules only through their index', () => {
    const bad: string[] = [];
    for (const file of walk(root)) {
      const own = path.relative(root, file).split(path.sep)[0];
      const src = fs.readFileSync(file, 'utf8');
      for (const m of src.matchAll(/from\s+['"]((?:\.\.\/)+)([a-z]+)\/([^'"]+)['"]/g)) {
        const target = path.resolve(path.dirname(file), m[1] + m[2] + '/' + m[3]);
        const rel = path.relative(root, target);
        if (rel.startsWith('..')) continue;
        const mod = rel.split(path.sep)[0];
        if (mod !== own && rel.split(path.sep).length > 1 && rel !== `${mod}/index`) bad.push(`${path.relative(root, file)} -> ${rel}`);
      }
    }
    expect(bad).toEqual([]);
  });
});
