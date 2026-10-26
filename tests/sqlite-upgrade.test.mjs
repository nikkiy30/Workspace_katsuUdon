import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import ts from 'typescript';

// Execute the repository's real schema initializer against a synthetic SQLite
// file. Only its native connection adapter is replaced; SQL is not duplicated.
function loadSchema(database) {
  const adapter = {
    execSync: (sql) => database.exec(sql),
    getAllSync: (sql) => database.prepare(sql).all(),
  };
  const source = readFileSync(new URL('../database/schema.ts', import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const exports = {};
  new Function('require', 'exports', outputText)((name) => {
    assert.equal(name, './connect');
    return { DatabaseConnection: { getInstance: () => ({ getDatabase: () => adapter }) } };
  }, exports);
  return new exports.DatabaseSchema();
}

test('old records survive adding cost, repeated initialization and reopening the file', () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'chop-schema-test-'));
  const filename = path.join(directory, 'synthetic.db');
  let database;
  try {
    database = new DatabaseSync(filename);
    database.exec(`CREATE TABLE waste_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT, food_name TEXT NOT NULL,
      throw_amount TEXT NOT NULL, buy_amount TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    database.prepare('INSERT INTO waste_records (id, food_name, throw_amount, buy_amount, created_at) VALUES (?, ?, ?, ?, ?)')
      .run(7, '試験用食材', '1個', '3個', '2025-07-18 10:30:00');
    loadSchema(database).createTables();
    const record = database.prepare('SELECT * FROM waste_records WHERE id = 7').get();
    assert.equal(record.food_name, '試験用食材');
    assert.equal(record.created_at, '2025-07-18 10:30:00');
    assert.equal(record.cost, 0);
    database.prepare('UPDATE waste_records SET cost = ? WHERE id = 7').run(150);
    loadSchema(database).createTables();
    database.close();
    database = new DatabaseSync(filename);
    assert.equal(database.prepare('SELECT COUNT(*) AS count FROM waste_records').get().count, 1);
    assert.equal(database.prepare('SELECT cost FROM waste_records WHERE id = 7').get().cost, 150);
  } finally {
    database?.close();
    rmSync(directory, { recursive: true, force: true }); // Only this test's synthetic directory.
  }
});
