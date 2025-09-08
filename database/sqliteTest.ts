import * as SQLite from 'expo-sqlite';


export const testSQLite = () => {
  try {
    console.log('SQLiteテスト開始');
    
    // データベースを開く
    const db = SQLite.openDatabaseSync('test.db');
    console.log('データベースを開きました:', db);
    
    // テーブル作成テスト
    db.execSync(
      'CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, name TEXT)'
    );
    console.log('テーブル作成成功');
    
    // データ入れてみる
    const result = db.runSync(
      'INSERT INTO test (name) VALUES (?)',
      ['テストデータ']
    );
    console.log('データ挿入成功:', result);
    
    // Selectで取得してみる
    const rows = db.getAllSync('SELECT * FROM test');
    console.log('データ取得成功:', rows);
    
    return true;
  } catch (error) {
    console.error('SQLiteテストエラー:', error);
    return false;
  }
};
