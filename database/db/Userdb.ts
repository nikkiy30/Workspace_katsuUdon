import { DatabaseConnection } from '../connect';
import { User, DatabaseResult } from '../types';

/**
 * ユーザーDAO（データアクセスオブジェクト）
 */
export class UserDAO {
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
        user.email,
        user.name || null,
        user.household_size || 1,
        user.cooking_frequency || 'weekly',
        JSON.stringify(user.dietary_restrictions || []),
        user.shopping_frequency || 'weekly'
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
        user.name || null,
        user.household_size !== undefined ? user.household_size : currentUser.household_size || 1,
        user.cooking_frequency !== undefined ? user.cooking_frequency : currentUser.cooking_frequency || 'weekly',
        user.dietary_restrictions !== undefined 
          ? JSON.stringify(user.dietary_restrictions) 
          : JSON.stringify(currentUser.dietary_restrictions || []),
        user.shopping_frequency !== undefined ? user.shopping_frequency : currentUser.shopping_frequency || 'weekly',
        id
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
      id: row.id,
      email: row.email,
      name: row.name,
      household_size: row.household_size,
      cooking_frequency: row.cooking_frequency,
      dietary_restrictions: row.dietary_restrictions ? JSON.parse(row.dietary_restrictions) : [],
      shopping_frequency: row.shopping_frequency,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }
}
