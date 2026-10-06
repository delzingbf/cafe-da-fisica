// Runs the TypeORM CLI through tsx so it can load the TypeScript data source and migrations.
// Usage (from apps/api): `npm run typeorm -- migration:run`, `npm run typeorm -- migration:generate AddFoo`.
//
// Convenience: a bare migration name after `migration:generate` / `migration:create` is placed in
// src/infrastructure/database/migrations/, so you can write `AddFoo` instead of the full path.
const MIGRATIONS_DIR = 'src/infrastructure/database/migrations';
const args = process.argv.slice(2);
const command = args.find((arg) => arg === 'migration:generate' || arg === 'migration:create');

if (command) {
    const nameIndex = args.indexOf(command) + 1;
    const name = args[nameIndex];
    if (name && !name.startsWith('-') && !name.includes('/') && !name.includes('\\')) {
        args[nameIndex] = `${MIGRATIONS_DIR}/${name}`;
    }
}

process.argv = [
    process.argv[0],
    process.argv[1],
    '-d',
    'src/infrastructure/database/data-source.ts',
    ...args,
];

await import('typeorm/cli.js');
