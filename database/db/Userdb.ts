import { DatabaseConnection } from '../connect';
import { DatabaseResult, User } from '../types';

/**
 * ユーザーDAO（データアクセスオブジェクト）
 */
export class UserDB {
  private db: import('expo-sqlite').SQLiteDatabase;

  constructor() {
    this.db = DatabaseConnection.getInstance().getDatabase();
  }

  /**
   * ユーザーを作成
   */
  public create(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): DatabaseResult {
    try {
      const sql = `
        INSERT INTO users (email, name, household_size, cooking_frequency, dietary_restrictions, shopping_frequency)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const result = this.db.runSync(sql, [
        user.household_size || '1人',
        user.cooking_frequency || '週3回',
        user.shopping_frequency || '週2回'
      ]);
      console.log('ユーザーを作成しました:', result);
      return result;
    } catch (error) {
      console.error('ユーザー作成エラー:', error);
      throw error;
    }
  }

  /**
   * IDでユーザーを取得
   */
  public findById(id: number): User | null {
    try {
      const sql = 'SELECT * FROM users WHERE id = ?';
      const result = this.db.getFirstSync(sql, [id]);
      if (result) {
        return this.mapRowToUser(result);
      }
      return null;
    } catch (error) {
      console.error('ユーザー取得エラー:', error);
      throw error;
    }
  }

  /**
   * メールアドレスでユーザーを取得
   */
  public findByEmail(email: string): User | null {
    try {
      const sql = 'SELECT * FROM users WHERE email = ?';
      const result = this.db.getFirstSync(sql, [email]);
      if (result) {
        return this.mapRowToUser(result);
      }
      return null;
    } catch (error) {
      console.error('ユーザー取得エラー:', error);
      throw error;
    }
  }

  /**
   * ユーザーを更新
   */
  public update(id: number, user: Partial<Omit<User, 'id' | 'created_at'>>): DatabaseResult {
    try {
      const sql = `
        UPDATE users 
        SET name = ?, household_size = ?, cooking_frequency = ?, 
            dietary_restrictions = ?, shopping_frequency = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      const currentUser = this.findById(id);
      if (!currentUser) {
        throw new Error('ユーザーが見つかりません');
      }

      const result = this.db.runSync(sql, [
        user.household_size || '1人',
        user.cooking_frequency || '週3回',
        user.shopping_frequency || '週2回',
      ]);
      console.log('ユーザーを更新しました:', result);
      return result;
    } catch (error) {
      console.error('ユーザー更新エラー:', error);
      throw error;
    }
  }

  /**
   * ユーザーを削除
   */
  public delete(id: number): DatabaseResult {
    try {
      const sql = 'DELETE FROM users WHERE id = ?';
      const result = this.db.runSync(sql, [id]);
      console.log('ユーザーを削除しました:', result);
      return result;
    } catch (error) {
      console.error('ユーザー削除エラー:', error);
      throw error;
    }
  }

  /**
   * 全ユーザーを取得
   */
  public findAll(): User[] {
    try {
      const sql = 'SELECT * FROM users ORDER BY created_at DESC';
      const results = this.db.getAllSync(sql);
      return results.map((row: any) => this.mapRowToUser(row));
    } catch (error) {
      console.error('ユーザー一覧取得エラー:', error);
      throw error;
    }
  }

  /**
   * データベースの行をUserオブジェクトにマッピング
   */
  private mapRowToUser(row: any): User {
    return {
      household_size: row.household_size,
      cooking_frequency: row.cooking_frequency,
      shopping_frequency: row.shopping_frequency,
    };
  }
}
