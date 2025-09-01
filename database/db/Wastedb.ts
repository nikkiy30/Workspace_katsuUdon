import { DatabaseConnection } from '../connect';
import { WasteRecord } from '../types';

export class WasteDB {
  private db: import('expo-sqlite').SQLiteDatabase;

  constructor() {
    this.db = DatabaseConnection.getInstance().getDatabase();
  }

  /**
   * 廃棄記録を取得
   */
  public getWasteRecords(): WasteRecord[] {
    try {
      const sql = 'SELECT * FROM waste_records';
      const result = this.db.getAllSync(sql) as any;
      return result.map((row: any) => ({
        id: row.id,
        food_name: row.food_name,
        throw_amount: row.throw_amount,
        buy_amount: row.buy_amount,
        created_at: row.created_at,
      }));
    } catch (error) {
      console.error('廃棄記録取得エラー:', error);
      return [];
    }
  }

  /**
   * 廃棄記録を追加
   */
  public addWasteRecord(record: WasteRecord): number | null {
    try {
      const sql = `
        INSERT INTO waste_records (food_name, throw_amount, buy_amount, created_at)
        VALUES (?, ?, ?, ?)
      `;
      const result = this.db.runSync(sql, [
        record.food_name,
        record.throw_amount,
        record.buy_amount,
        record.created_at,
      ]);
      return result.lastInsertRowId || null;
    } catch (error) {
      console.error('廃棄記録追加エラー:', error);
      return null;
    }
  }

  /**
   * 廃棄記録を削除（成功時true、失敗時false）を投げる
   */
  public deleteWasteRecord(id: number): boolean {
    try {
      const sql = 'DELETE FROM waste_records WHERE id = ?';
      this.db.runSync(sql, [id]);
      return true;
    } catch (error) {
      console.error('廃棄記録削除エラー:', error);
      return false;
    }
  }
}
