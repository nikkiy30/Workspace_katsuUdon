import * as SQLite from 'expo-sqlite';

/**
 * シングルトン
 */
export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private db: SQLite.SQLiteDatabase | null = null;
  private readonly dbName = 'katsuUdon.db';

  private constructor() {}

  /**
   * シングルトン取得
   */
  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  /**
   * .db取得
   */
  public connect(): SQLite.SQLiteDatabase {
    if (!this.db) {
      try {
        this.db = SQLite.openDatabaseSync(this.dbName);
        console.log(`データベース "${this.dbName}" に接続しました`);
      } catch (error) {
        console.error('データベース接続エラー:', error);
        throw error;
      }
    }
    return this.db;
  }

  /**
   * .db取得できたか判断して分岐させるやつ
   */
  public getDatabase(): SQLite.SQLiteDatabase {
    if (!this.db) {
      return this.connect();
    }
    return this.db;
  }

  /**
   * .db閉じる（接続切る）
   */
  public close(): void {
    if (this.db) {
      try {
        this.db.closeSync();
        this.db = null;
        console.log('データベース接続を閉じました');
      } catch (error) {
        console.error('データベース切断エラー:', error);
      }
    }
  }

  /**
   * 一応.db取れたか確認してBool返そう
   */
  public isConnected(): boolean {
    return this.db !== null;
  }
}
