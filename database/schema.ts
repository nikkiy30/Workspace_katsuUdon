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
   * デモ用：テーブル作成とダミーデータ挿入
   */
  public createTablesWithDummyData(): void {
    try {
      this.createProfileTable();
      this.resetWasteRecordsTable(); // ダミーデータ付きで再作成
      this.createDiagnosisEntriesTable();
      console.log('デモ用テーブルとダミーデータの作成が完了しました');
    } catch (error) {
      console.error('デモ用テーブル作成エラー:', error);
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
   * waste_recordsテーブルのみを削除して再作成（デモ用）
   */
  public resetWasteRecordsTable(): void {
    try {
      this.db.execSync('DROP TABLE IF EXISTS waste_records');
      console.log('waste_recordsテーブルを削除しました');
      this.createWasteRecordsTable();
      this.insertDummyWasteData();
      console.log('waste_recordsテーブルを再作成し、ダミーデータを挿入しました');
    } catch (error) {
      console.error('waste_recordsテーブル再作成エラー:', error);
      throw error;
    }
  }

  /**
   * ダミーの廃棄記録データを挿入（デモ用）
   */
  private insertDummyWasteData(): void {
    const dummyData = [
      {
        food_name: '人参',
        throw_amount: '1本',
        buy_amount: '3本',
        cost: 150,
        created_at: '2025-07-18 10:30:00'
      },
      {
        food_name: '牛乳',
        throw_amount: '500ml',
        buy_amount: '1000ml',
        cost: 200,
        created_at: '2025-07-22 14:20:00'
      },
      {
        food_name: 'もやし',
        throw_amount: '1袋',
        buy_amount: '2袋',
        cost: 80,
        created_at: '2025-07-26 09:15:00'
      },
      {
        food_name: '豚肉',
        throw_amount: '200g',
        buy_amount: '500g',
        cost: 350,
        created_at: '2025-07-30 16:45:00'
      },
      {
        food_name: 'レタス',
        throw_amount: '半玉',
        buy_amount: '1玉',
        cost: 120,
        created_at: '2025-08-03 11:10:00'
      },
      {
        food_name: '卵',
        throw_amount: '2個',
        buy_amount: '10個',
        cost: 180,
        created_at: '2025-08-06 08:30:00'
      },
      {
        food_name: 'きゅうり',
        throw_amount: '1本',
        buy_amount: '4本',
        cost: 100,
        created_at: '2025-08-10 13:20:00'
      },
      {
        food_name: '鶏肉',
        throw_amount: '300g',
        buy_amount: '800g',
        cost: 450,
        created_at: '2025-08-14 17:50:00'
      },
      {
        food_name: 'トマト',
        throw_amount: '2個',
        buy_amount: '5個',
        cost: 200,
        created_at: '2025-08-18 12:15:00'
      },
      {
        food_name: 'パン',
        throw_amount: '3枚',
        buy_amount: '8枚',
        cost: 150,
        created_at: '2025-08-21 19:30:00'
      },
      {
        food_name: 'じゃがいも',
        throw_amount: '2個',
        buy_amount: '6個',
        cost: 180,
        created_at: '2025-07-16 15:45:00'
      },
      {
        food_name: 'キャベツ',
        throw_amount: '1/4玉',
        buy_amount: '1玉',
        cost: 130,
        created_at: '2025-07-20 09:20:00'
      },
      {
        food_name: 'ヨーグルト',
        throw_amount: '1個',
        buy_amount: '4個',
        cost: 120,
        created_at: '2025-07-24 07:40:00'
      },
      {
        food_name: 'バナナ',
        throw_amount: '3本',
        buy_amount: '1房',
        cost: 200,
        created_at: '2025-07-28 20:10:00'
      },
      {
        food_name: 'ほうれん草',
        throw_amount: '1束',
        buy_amount: '2束',
        cost: 160,
        created_at: '2025-08-01 11:55:00'
      },
      {
        food_name: '豆腐',
        throw_amount: '1/2丁',
        buy_amount: '1丁',
        cost: 90,
        created_at: '2025-08-05 14:35:00'
      },
      {
        food_name: 'なす',
        throw_amount: '2本',
        buy_amount: '4本',
        cost: 140,
        created_at: '2025-08-09 16:25:00'
      },
      {
        food_name: 'りんご',
        throw_amount: '1個',
        buy_amount: '5個',
        cost: 300,
        created_at: '2025-08-13 10:15:00'
      },
      {
        food_name: 'しめじ',
        throw_amount: '1パック',
        buy_amount: '2パック',
        cost: 180,
        created_at: '2025-08-28 18:40:00'
      },
      {
        food_name: 'さつまいも',
        throw_amount: '1本',
        buy_amount: '3本',
        cost: 220,
        created_at: '2025-09-01 13:50:00'
      }
    ];

    for (const data of dummyData) {
      const sql = `
        INSERT INTO waste_records (food_name, throw_amount, buy_amount, cost, created_at)
        VALUES (?, ?, ?, ?, ?)
      `;
      this.db.runSync(sql, [
        data.food_name,
        data.throw_amount,
        data.buy_amount,
        data.cost,
        data.created_at
      ]);
    }
    console.log(`${dummyData.length}件のダミー廃棄記録を挿入しました`);
  }

  /**
   * デモ用：現在のデータを確認
   */
  public getWasteRecordsCount(): number {
    try {
      const result = this.db.getFirstSync('SELECT COUNT(*) as count FROM waste_records') as any;
      return result?.count || 0;
    } catch (error) {
      console.error('廃棄記録数取得エラー:', error);
      return 0;
    }
  }

  /**
   * デモ用：全ての廃棄記録を取得
   */
  public getAllWasteRecords(): any[] {
    try {
      return this.db.getAllSync('SELECT * FROM waste_records ORDER BY created_at DESC');
    } catch (error) {
      console.error('廃棄記録取得エラー:', error);
      return [];
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
