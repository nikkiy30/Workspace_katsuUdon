const path = require('path');
const { DatabaseConnection } = require('../database/connect');
const { DatabaseSchema } = require('../database/schema');
const { WasteDB } = require('../database/db/Wastedb');

/**
 * 全ての廃棄データを削除するスクリプト
 */
async function clearAllWasteData() {
  try {
    console.log('廃棄データ削除を開始します...');
    
    // データベース接続を初期化
    const dbConnection = DatabaseConnection.getInstance();
    
    // スキーマを初期化（テーブルが存在しない場合に作成）
    const schema = new DatabaseSchema();
    schema.createTables();
    
    // 削除前の状態を確認
    const wasteDB = new WasteDB();
    console.log('\n削除前の廃棄データ:');
    wasteDB.logAllWasteRecords();
    
    // 全ての廃棄記録を削除
    const success = wasteDB.deleteAllWasteRecords();
    
    if (success) {
      console.log('\n✅ 全ての廃棄データを正常に削除しました');
    } else {
      console.log('\n❌ 廃棄データの削除に失敗しました');
    }
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  }
}

// スクリプトの実行
if (require.main === module) {
  clearAllWasteData();
}
