/**
 * アプリ全体で使用する統一カラーパレット
 * 画像の色設定に基づいて定義
 */


export const Colors = {
  light: {
    // ベースカラー
    base: '#FFFFFF',           // Base #FFFFFF
    
    // メインカラー
    primary: '#039ADA',        // Main #039ADA (アプリのメインブランドカラー)
    
    // テキストカラー
    text: '#20556C',           // Text #20556C (メインテキスト)
    textSecondary: '#ABC5D0',  // Text2 #ABC5D0 (セカンダリテキスト)
    textTertiary: '#81CCED',   // Text3 #81CCED (第三テキスト)
    
    // サブカラー
    sub: '#E6F5FB',            // Sub #E6F5FB (背景やボーダー)
    subSecondary: '#BBEBFF',   // Sub2 #BBEBFF (アクセントカラー)

    background: '#FFFFFF',

    accent: '#FF7B53'
  }
};

// カラーユーティリティ関数
export const getOpacityColor = (color: string, opacity: number): string => {
  return `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
};

// カテゴリー色の統一管理
export const getCategoryColor = (category: string): string => {
  const categoryColors = {
    breakfast: '#FF9800', // オレンジ（朝食）
    lunch: '#2196F3',     // 青（昼食）
    dinner: '#9C27B0',    // 紫（夕食）
    snack: '#4CAF50',     // 緑（おやつ）
    default: Colors.light.primary,
  };
  return categoryColors[category as keyof typeof categoryColors] || categoryColors.default;
};

