import { DatabaseConnection } from '../connect';
import { Profile } from '../types';


export class UserDB {
  private db: import('expo-sqlite').SQLiteDatabase;
  private readonly SINGLE_USER_ID = 1;

  constructor() {
    this.db = DatabaseConnection.getInstance().getDatabase();
  }

    /**
   * プロフィールを取得
   */
  public getProfile(): Profile | null {
    try {
      const sql = 'SELECT * FROM profile WHERE id = ?';
      const result = this.db.getFirstSync(sql, [this.SINGLE_USER_ID]) as any;
      
      if (result) {
        return {
          household_size: result.household_size,
          cooking_frequency: result.cooking_frequency,
          shopping_frequency: result.shopping_frequency,
        };
      }
      return null;
    } catch (error) {
      console.error('プロフィール取得エラー:', error);
      throw error;
    }
  }

  /**
   * プロフィールを保存（作成または更新）
   */
  public saveProfile(profile: Profile): void {
    try {
      const existing = this.getProfile();
      
      if (existing) {
        // 更新
        const sql = `
          UPDATE profile 
          SET household_size = ?, cooking_frequency = ?, shopping_frequency = ?
          WHERE id = ?
        `;
        this.db.runSync(sql, [
          profile.household_size,
          profile.cooking_frequency,
          profile.shopping_frequency,
          this.SINGLE_USER_ID
        ]);
        console.log('プロフィールを更新しました');
      } else {
        // 新規作成
        const sql = `
          INSERT INTO profile (id, household_size, cooking_frequency, shopping_frequency)
          VALUES (?, ?, ?, ?)
        `;
        this.db.runSync(sql, [
          this.SINGLE_USER_ID,
          profile.household_size,
          profile.cooking_frequency,
          profile.shopping_frequency
        ]);
        console.log('プロフィールを作成しました');
      }
    } catch (error) {
      console.error('プロフィール保存エラー:', error);
      throw error;
    }
  }

  /**
   * プロフィールが存在するかチェックしてBoolでも返そうかと
   */
  public hasProfile(): boolean {
    try {
      const profile = this.getProfile();
      return profile !== null;
    } catch (error) {
      console.error('プロフィール存在確認エラー:', error);
      return false;
    }
  }
}
