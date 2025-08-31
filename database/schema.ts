import { DatabaseConnection } from './connect';

/**
 * データベーススキーマ定義
 */
export class DatabaseSchema {
  private db: import('expo-sqlite').SQLiteDatabase;

  constructor() {
    this.db = DatabaseConnection.getInstance().getDatabase();
  }

  /**
   //* 全テーブルを作成
   */
  public createTables(): void {
    try {
      this.createUsersTable();
      this.createWasteRecordsTable();
      this.createFoodItemsTable();
      this.createDiagnosisHistoryTable();
      console.log('全テーブルの作成が完了しました');
    } catch (error) {
      console.error('テーブル作成エラー:', error);
      throw error;
    }
  }

  /**
   * ユーザーテーブル
   */
  private createUsersTable(): void {
    const sql = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        household_size INTEGER DEFAULT 1,
        cooking_frequency TEXT DEFAULT 'weekly',
        dietary_restrictions TEXT, -- JSON形式で保存
        shopping_frequency TEXT DEFAULT 'weekly',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    this.db.execSync(sql);
    console.log('usersテーブルを作成しました');
  }

  /**
   * 食品廃棄記録テーブル
   */
  private createWasteRecordsTable(): void {
    const sql = `
      CREATE TABLE IF NOT EXISTS waste_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        food_name TEXT NOT NULL,
        amount TEXT,
        waste_reason TEXT,
        purchase_date DATE,
        expiry_date DATE,
        waste_date DATE NOT NULL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `;
    this.db.execSync(sql);
    console.log('waste_recordsテーブルを作成しました');
  }

  /**
   * 食材アイテムテーブル（現在の在庫）
   */
  private createFoodItemsTable(): void {
    const sql = `
      CREATE TABLE IF NOT EXISTS food_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        food_name TEXT NOT NULL,
        amount TEXT,
        purchase_date DATE,
        expiry_date DATE,
        storage_location TEXT,
        notes TEXT,
        is_consumed BOOLEAN DEFAULT 0,
        consumed_date DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `;
    this.db.execSync(sql);
    console.log('food_itemsテーブルを作成しました');
  }

  /**
   * AI診断履歴テーブル
   */
  private createDiagnosisHistoryTable(): void {
    const sql = `
      CREATE TABLE IF NOT EXISTS diagnosis_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        food_name TEXT NOT NULL,
        amount TEXT,
        expiry_date DATE,
        notes TEXT,
        ai_recommendation TEXT, -- AI分析結果
        purchase_decision BOOLEAN, -- 購入したかどうか
        diagnosis_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `;
    this.db.execSync(sql);
    console.log('diagnosis_historyテーブルを作成しました');
  }

  /**
   * テーブル削除（開発用）
   */
  public dropAllTables(): void {
    try {
      this.db.execSync('DROP TABLE IF EXISTS diagnosis_history');
      this.db.execSync('DROP TABLE IF EXISTS food_items');
      this.db.execSync('DROP TABLE IF EXISTS waste_records');
      this.db.execSync('DROP TABLE IF EXISTS users');
      console.log('全テーブルを削除しました');
    } catch (error) {
      console.error('テーブル削除エラー:', error);
      throw error;
    }
  }

  /**
   * テーブル一覧を取得
   */
  public getTableList(): string[] {
    try {
      const result = this.db.getAllSync(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
      );
      return result.map((row: any) => row.name);
    } catch (error) {
      console.error('テーブル一覧取得エラー:', error);
      return [];
    }
  }
}
