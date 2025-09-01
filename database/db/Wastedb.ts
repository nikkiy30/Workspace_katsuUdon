import { DatabaseConnection } from '../connect';
import { WasteRecord, WasteRecordInput } from '../types';

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
   * 廃棄記録をデータベースに追加
   */
  public addWasteRecord(record: WasteRecordInput): number | null {
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
      
      console.log('廃棄記録を追加しました:', record);
      // 追加後、全ての記録をログ表示
      this.logAllWasteRecords();
      
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

  /**
   * 現在のwaste_recordsデータベースの内容をコンソールに表示
   */
  public logAllWasteRecords(): void {
    try {
      const records = this.getWasteRecords();
      console.log('=== waste_records データベース内容 ===');
      console.log(`総件数: ${records.length}件`);
      
      if (records.length === 0) {
        console.log('データがありません');
      } else {
        records.forEach((record, index) => {
          console.log(`--- ${index + 1}件目 ---`);
          console.log(`ID: ${record.id}`);
          console.log(`食品名: ${record.food_name}`);
          console.log(`廃棄量: ${record.throw_amount}`);
          console.log(`購入量: ${record.buy_amount}`);
          console.log(`作成日時: ${record.created_at}`);
        });
      }
      console.log('===============================');
    } catch (error) {
      console.error('廃棄記録ログ表示エラー:', error);
    }
  }

  /**
   * 最新の廃棄記録をコンソールに表示
   */
  public logLatestWasteRecord(): void {
    try {
      const sql = 'SELECT * FROM waste_records ORDER BY created_at DESC LIMIT 1';
      const result = this.db.getFirstSync(sql) as any;
      
      if (result) {
        console.log('=== 最新の廃棄記録 ===');
        console.log(`ID: ${result.id}`);
        console.log(`食品名: ${result.food_name}`);
        console.log(`廃棄量: ${result.throw_amount}`);
        console.log(`購入量: ${result.buy_amount}`);
        console.log(`作成日時: ${result.created_at}`);
        console.log('====================');
      } else {
        console.log('廃棄記録がありません');
      }
    } catch (error) {
      console.error('最新廃棄記録ログ表示エラー:', error);
    }
  }
}
