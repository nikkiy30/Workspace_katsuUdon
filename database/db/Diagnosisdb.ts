import { DatabaseConnection } from '../connect';

export interface DiagnosisEntryInput {
  food_name: string;
  amount?: string;
  expiry_date?: string; // YYYY-MM-DD
}

export interface DiagnosisEntry extends DiagnosisEntryInput {
  id: number;
  created_at: string;
}

export class DiagnosisDB {
  private db: import('expo-sqlite').SQLiteDatabase;

  constructor() {
    this.db = DatabaseConnection.getInstance().getDatabase();
  }

  /**
   * 入力を保存
   */
  public addEntry(entry: DiagnosisEntryInput): number | null {
    try {
      const sql = `
        INSERT INTO diagnosis_entries (food_name, amount, expiry_date)
        VALUES (?, ?, ?)
      `;
      const res = this.db.runSync(sql, [
        entry.food_name,
        entry.amount || null,
        entry.expiry_date || null,
      ]);
      return res.lastInsertRowId ?? null;
    } catch (e) {
      console.error('diagnosis_entries 追加エラー:', e);
      return null;
    }
  }

  /**
   * 直近の入力を取得（新しい順）
   */
  public getRecentEntries(limit: number = 10): DiagnosisEntry[] {
    try {
      const sql = `
        SELECT * FROM diagnosis_entries
        ORDER BY id DESC
        LIMIT ?
      `;
      const rows = this.db.getAllSync(sql, [limit]) as any[];
      return rows.map((r) => ({
        id: r.id,
        food_name: r.food_name,
        amount: r.amount ?? undefined,
        expiry_date: r.expiry_date ?? undefined,
        created_at: r.created_at,
      }));
    } catch (e) {
      console.error('diagnosis_entries 取得エラー:', e);
      return [];
    }
  }

  /**
   * エントリを削除
   */
  public deleteEntry(id: number): boolean {
    try {
      const sql = 'DELETE FROM diagnosis_entries WHERE id = ?';
      this.db.runSync(sql, [id]);
      return true;
    } catch (e) {
      console.error('diagnosis_entries 削除エラー:', e);
      return false;
    }
  }
}
