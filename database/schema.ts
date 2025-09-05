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
   //! 現状プロフィールと廃棄のみ
   */
  public createTables(): void {
    try {
      this.createProfileTable();
      this.createWasteRecordsTable();
      this.migrateWasteRecordsTable(); // マイグレーション実行
      // 任意のテーブル（必要に応じて拡張）
      // this.createFoodItemsTable();
      this.createDiagnosisEntriesTable();
      console.log('全テーブルの作成が完了しました（既存の場合はスキップ）');
    } catch (error) {
      console.error('テーブル作成エラー:', error);
      throw error;
    }
  }

  /**
   * ユーザープロフィールテーブル
   */
  private createProfileTable(): void {
    const sql = `
      CREATE TABLE IF NOT EXISTS profile (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        household_size TEXT DEFAULT "1人",
        cooking_frequency TEXT DEFAULT "週3回",
        shopping_frequency TEXT DEFAULT "週3回"
      )
    `;
    this.db.execSync(sql);
    console.log('profileテーブル準備完了');
  }

  /**
   * 食品廃棄記録テーブル
   */
  private createWasteRecordsTable(): void {
    const sql = `
      CREATE TABLE IF NOT EXISTS waste_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        food_name TEXT NOT NULL,
        throw_amount TEXT NOT NULL,
        buy_amount TEXT NOT NULL,
        cost REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    this.db.execSync(sql);
    console.log('waste_recordsテーブル準備完了');
  }

  /**
   * waste_recordsテーブルにcostカラムを追加するマイグレーション
   */
  private migrateWasteRecordsTable(): void {
    try {
      // costカラムが存在するかチェック
      const result = this.db.getAllSync("PRAGMA table_info(waste_records)") as any;
      const hasCostColumn = result.some((column: any) => column.name === 'cost');
      
      if (!hasCostColumn) {
        this.db.execSync('ALTER TABLE waste_records ADD COLUMN cost REAL DEFAULT 0');
        console.log('waste_recordsテーブルにcostカラムを追加しました');
      } else {
        console.log('waste_recordsテーブルのcostカラムは既に存在します');
      }
    } catch (error) {
      console.error('waste_recordsテーブルマイグレーションエラー:', error);
    }
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
   * AI診断入力の簡易テーブル（サジェスト元データ）
   */
  private createDiagnosisEntriesTable(): void {
    const sql = `
      CREATE TABLE IF NOT EXISTS diagnosis_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        food_name TEXT NOT NULL,
        amount TEXT,
        expiry_date DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    this.db.execSync(sql);
    console.log('diagnosis_entriesテーブルを作成しました');
  }

  /**
   * テーブル削除（開発用）
   */
  public dropAllTables(): void {
    try {
      this.db.execSync('DROP TABLE IF EXISTS diagnosis_history');
      this.db.execSync('DROP TABLE IF EXISTS food_items');
      this.db.execSync('DROP TABLE IF EXISTS waste_records');
      this.db.execSync('DROP TABLE IF EXISTS profile');
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
