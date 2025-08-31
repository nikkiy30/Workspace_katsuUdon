import { DatabaseConnection } from './connect';
import { DatabaseSchema } from './schema';
import { UserDAO } from './dao/UserDAO';

/**
 * データベース初期化クラス
 */
export class DatabaseInitializer {
  private connection: DatabaseConnection;
  private schema: DatabaseSchema;

  constructor() {
    this.connection = DatabaseConnection.getInstance();
    this.schema = new DatabaseSchema();
  }

  /**
   * データベースを初期化（接続 + テーブル作成）
   */
  public async initialize(): Promise<void> {
    try {
      console.log('データベース初期化開始...');
      
      // データベースに接続
      this.connection.connect();
      
      // テーブルを作成
      this.schema.createTables();
      
      console.log('データベース初期化完了！');
    } catch (error) {
      console.error('データベース初期化エラー:', error);
      throw error;
    }
  }

  /**
   * 開発用：データベースをリセット
   */
  public async reset(): Promise<void> {
    try {
      console.log('データベースリセット開始...');
      
      // 全テーブル削除
      this.schema.dropAllTables();
      
      // テーブル再作成
      this.schema.createTables();
      
      console.log('データベースリセット完了！');
    } catch (error) {
      console.error('データベースリセットエラー:', error);
      throw error;
    }
  }

  /**
   * テストデータを挿入
   */
  public async seedTestData(): Promise<void> {
    try {
      console.log('テストデータ挿入開始...');
      
      const userDAO = new UserDAO();
      
      // テストユーザーを作成
      const testUser = {
        email: 'test@example.com',
        name: 'テストユーザー',
        household_size: 2,
        cooking_frequency: 'weekly' as const,
        dietary_restrictions: ['グルテンフリー'],
        shopping_frequency: 'weekly' as const
      };
      
      userDAO.create(testUser);
      
      console.log('テストデータ挿入完了！');
    } catch (error) {
      console.error('テストデータ挿入エラー:', error);
      throw error;
    }
  }

  /**
   * データベース状態を確認
   */
  public checkStatus(): void {
    try {
      console.log('=== データベース状態確認 ===');
      console.log('接続状態:', this.connection.isConnected());
      
      const tables = this.schema.getTableList();
      console.log('作成されたテーブル:', tables);
      
      if (tables.includes('users')) {
        const userDAO = new UserDAO();
        const users = userDAO.findAll();
        console.log('ユーザー数:', users.length);
        if (users.length > 0) {
          console.log('最初のユーザー:', users[0]);
        }
      }
      
      console.log('=== 確認完了 ===');
    } catch (error) {
      console.error('データベース状態確認エラー:', error);
    }
  }
}

// エクスポート用の便利関数
export const initializeDatabase = async () => {
  const initializer = new DatabaseInitializer();
  await initializer.initialize();
  return initializer;
};

export const resetDatabase = async () => {
  const initializer = new DatabaseInitializer();
  await initializer.reset();
  return initializer;
};
