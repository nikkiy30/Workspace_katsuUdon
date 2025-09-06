import { UserDB } from '@/database/db/Userdb'
import { WasteDB } from '@/database/db/Wastedb'
import { GoogleGenAI } from '@google/genai'
import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import Markdown from 'react-native-markdown-display'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface ChatMessage {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

//! Gemini APIの設定
const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || ''
const genAI = new GoogleGenAI({ apiKey: apiKey })

// データベースからデータを取得する関数
const getDatabaseData = () => {
  const wasteDB = new WasteDB()
  const userDB = new UserDB()
  
  // プロフィール情報を取得
  const profile = userDB.getProfile()
  
  // 廃棄記録を取得（全履歴）
  const wasteRecords = wasteDB.getWasteRecords()
  
  return {
    profile: {
      household_size: profile?.household_size || '記録なし',
      cooking_frequency: profile?.cooking_frequency || '記録なし',
      shopping_frequency: profile?.shopping_frequency || '記録なし'
    },
    wasteRecords
  }
}

export default function AiChatScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const insets = useSafeAreaInsets()
  const [question, setQuestion] = useState('')
  const [aiAnalysis, setAiAnalysis] = useState('')
  const [isFirstMessage, setIsFirstMessage] = useState(true)
  // AIが初手投げか否かのBoolean
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [keyboardVisible, setKeyboardVisible] = useState(false)
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardVisible(true)
      setKeyboardHeight(e.endCoordinates.height)
    })
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false)
      setKeyboardHeight(0)
    })

    return () => {
      showSubscription?.remove()
      hideSubscription?.remove()
    }
  }, [])
  
  const diagnosisData = {
    foodName: params.foodName as string || '',
    amount: params.amount as string || '',
    expiryDate: params.expiryDate as string || '',
    expiryType: params.expiryType as 'best_before' | 'use_by' || 'best_before',
    notes: params.notes as string || ''
  }
  // messageはユーザーの初手メッセージ以外を記録（チャットののUIレンダリングに使用するためのやつ)
  // 全メッセージを記録してAIのプロンプトに使うので格納
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [allMessages, setAllMessages] = useState<ChatMessage[]>([])
  // 固定サジェストの内容
  const [quickReplies, setQuickReplies] = useState<string[]>([
    '消費できるレシピを教えて',
    '使用計画を考えて'
  ])

  // AIレスポンスからJSONを抽出して評価レベルを取得する関数（最終的に数値の1~3で返す）
  const extractRecommendationFromJSON = (text: string): number => {
    try {
      // JSONブロックを探す
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/)
      if (jsonMatch) {
        const jsonData = JSON.parse(jsonMatch[1])
        const recommendation = jsonData.recommendation
        
        if (recommendation === '購入してもいい') return 3
        if (recommendation === '条件付きでOK') return 2
        if (recommendation === 'おすすめしない') return 1
      }
    } catch (error) {
      console.log('JSON解析エラー（フォールバックします）:', error)
    }

    // JSONが見つからない場合はテキストベースで判定（フォールバック）
    const content = text.toLowerCase()
    if (content.includes('購入してもいい')) return 3
    if (content.includes('条件付きでok') || content.includes('条件付きで')) return 2
    if (content.includes('おすすめしない')) return 1
    
    return 2 // デフォルト
  }

  // AIレスポンスからJSONブロックを除去する関数
  const removeJSONFromResponse = (text: string): string => {
    // textがundefinedやnullの場合は空文字を返す
    if (!text) return ''
    // JSONブロック（```json...```）を除去
    return text.replace(/```json\s*[\s\S]*?\s*```/g, '').trim()
  }

  // 推奨度に応じたSVGアイコンを返す関数
  const getRecommendationIcon = (level: number) => {
    if (level === 3) {
      return require('@/assets/images/reccomend3.svg') // 購入してもいい
    } else if (level === 2) {
      return require('@/assets/images/reccomend2.svg') // 条件付きでOK
    } else {
      return require('@/assets/images/reccomend1.svg') // おすすめしない
    }
  }



  // 初回読み込み時にAI分析を実行(.onappear)
  useEffect(() => {
    if (diagnosisData.foodName && diagnosisData.amount) {
      performAIAnalysis()
    }
  }, [])

  // AI初手投げの時に実行される
  const performAIAnalysis = async () => {
    setIsAnalyzing(true)
    try {
      // データベースからデータを取得
      const dbData = getDatabaseData()
      
      const prompt = `
あなたは食品ロス防止アドバイザーです。
次の条件に基づき、購入前診断を２段階で出力してください。

【入力情報】
食材名：${diagnosisData.foodName}
購入予定量：${diagnosisData.amount}
${diagnosisData.expiryType === 'best_before' ? '賞味期限' : '消費期限'}：${diagnosisData.expiryDate}
備考：${diagnosisData.notes || 'なし'}

【プロフィール情報】
世帯人数：${dbData.profile.household_size}
自炊頻度：${dbData.profile.cooking_frequency}
買い物の頻度：${dbData.profile.shopping_frequency}

【廃棄経歴】
過去の廃棄記録全履歴：
${dbData.wasteRecords.length > 0 ? 
  dbData.wasteRecords.map(record => 
    `食材名:${record.food_name} 購入量:${record.buy_amount} 廃棄量:${record.throw_amount} 日付:${record.created_at.split('T')[0]}`
  ).join('\n') : 
  '廃棄記録がありません'}

【その他】 
現在の季節から、食品の劣化の可能性が検討される場合は出力に活用してください。

---


【出力形式の指示】

- 購入推奨度を「購入してもいい」「条件付きでOK」「おすすめしない」の3段階で示してください。
- 判定ルール:
   - 購入予定量が世帯人数や自炊頻度に明らかに不釣り合い → 必ず「おすすめしない」
   - 廃棄経歴で同じ食材の廃棄率が高い（50%以上） → 原則「おすすめしない」
   - 量や過去の傾向にやや不安がある場合 → 「条件付きでOK」
   - 無理なく消費できそうな場合 → 「購入してもいい」
- 簡単な理由を、100文字以内で、簡潔かつ分かりやすく記述してください。

- タイトル: 「廃棄を防ぐためのヒント」
- 箇条書きでアドバイス:
  - 「買った後、まずすること」
  - 「新鮮さを保つには」
  - 「使い切れなさそうなら」
- 各項目は必ず100文字以内で具体的に記述してください。

---

【追加条件】
- 全体を通して短い文、太字や改行を活用し、読みやすい構成にしてください。
- 専門用語を避け、親しみやすい言葉を使ってください。
- 保存方法は安全が担保できない場合は「安全な保存情報が確認できません。公式情報を参照してください。」と必ず明示。

【出力例　※これをベースに出力してください。】

**購入推奨度：条件付きでOK**  
理由：過去に鶏肉の廃棄履歴はありますが、購入量と賞味期限を考慮すると、工夫次第で使い切れる可能性があります。  

---

## ◆ 廃棄を防ぐためのヒント

### 🛠 買った後、まずすること
- **小分け冷凍！**  
  1kgを200gずつに小分けし、ラップで包んでからフリーザーバッグへ。  
  必要な分だけ解凍できて調理も楽になります。  

### ❄️ 新鮮さを保つには
- **冷蔵庫の奥へ！**  
  鶏肉はチルド室や冷蔵室の奥で保存すると温度が安定します。  
  パックのままか、密閉容器に入れるとさらに長持ち。  

### 🍳 使い切れなさそうなら
- **即席レシピを！**  
  一部を唐揚げや照り焼きにして冷凍保存。  
  また、野菜と炒め物やスープの具材にして、計画的に消費しましょう。

【備考】
- 診断に不要な情報は無理に考慮しなくてよい。
**最後に、以下のJSON形式で評価情報を追加してください：**
\`\`\`json
{"recommendation": "購入してもいい" または "条件付きでOK" または "おすすめしない"}
\`\`\`
`

      const response = await genAI.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: prompt,
      })

      const analysisResult = response.text ?? 'エラーが発生しました'
      setAiAnalysis(analysisResult)
      
      // 初期メッセージのやつ
      const initialMessage: ChatMessage = {
        id: '1',
        text: analysisResult,
        isUser: false,
        timestamp: new Date(),
      }
      
      // 全メッセージとその場のメッセージに追加
      setMessages([initialMessage])
      setAllMessages([initialMessage])
      
      // メッセージ入力の上にあるタップでちょろっと質問できるやつ
      // 固定サジェストを設定
      setQuickReplies([
        '消費できるレシピを教えて',
        '使用計画を考えて'
      ])
    } catch (error) {
      console.error('AI分析エラー:', error)
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        text: 'AI分析に失敗しました。しばらくしてから再度お試しください。',
        isUser: false,
        timestamp: new Date(),
      }
      setMessages([errorMessage])
      setAllMessages([errorMessage])
    } finally {
      //* AI初手投げBoolは最終的にここでfalseになり2投目以降はセーフ
      setIsAnalyzing(false)
    }
  }

// サジェスト生成する源のやつ
//   const generateQuickReplies = async (aiResponse: string) => {
//     try {
//       const prompt = `
// 以下のAI診断結果を読んで、ユーザーが聞きそうな追加質問を3つ提案してください。
// 各質問は簡潔で、一般的なフォローアップの内容にしてください。

// AI診断結果：
// ${aiResponse}

// 3つの質問を以下の形式で出力してください（必ず3行で、余計な文字は含めないでください）（以下の質問内容は例なので必ずしもこの質問である必要はなく，ユーザーが聞きそうな質問事項にする事を優先してください）：
// もっと詳しい保存方法を教えて
// 代替レシピを提案して
// 同じ食材での過去の廃棄記録は？
// `

//       const response = await genAI.models.generateContent({
//         model: 'gemini-2.5-flash-lite',
//         contents: prompt,
//       })

//       const suggestionsText = response.text?.trim() || ''
//       const suggestions = suggestionsText.split('\n').filter(line => line.trim().length > 0).slice(0, 3)
      
//       setQuickReplies(suggestions)
//     } catch (error) {
//       console.error('クイック返信生成エラー:', error)
//       // デフォルトの質問を設定
//       setQuickReplies([
//         'もっと詳しい保存方法を教えて',
//         '代替レシピを提案して',
//         '購入量を調整するアドバイスをください'
//       ])
//     }
//   }

  //! 手入力の質問時
  // リプライ返信の時に実行されるやつ
  const handleSendQuestion = async () => {
    if (!question.trim()) return

    // ユーザーメッセージを追加
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: question,
      isUser: true,
      timestamp: new Date(),
    }
    //前のメッセージに加えてユーザーメッセージを追加
    setMessages(prev => [...prev, userMessage])
    setAllMessages(prev => [...prev, userMessage])
    setQuestion('')
    setLoading(true)

    try {
      // データベースからデータを取得
      const dbData = getDatabaseData()
      
      // Gemini APIで追加質問に答える
      const followUpPrompt = `
あなたは食品ロス防止アドバイザーです。

前回の診断対象:
食材名：${diagnosisData.foodName}
購入予定量：${diagnosisData.amount}
期限：${diagnosisData.expiryDate}
備考：${diagnosisData.notes || 'なし'}

【プロフィール情報】
世帯人数：${dbData.profile.household_size}
自炊頻度：${dbData.profile.cooking_frequency}
買い物の頻度：${dbData.profile.shopping_frequency}

【廃棄経歴】
過去の廃棄記録全履歴：
${dbData.wasteRecords.length > 0 ? 
  dbData.wasteRecords.map(record => 
    `食材名:${record.food_name} 購入量:${record.buy_amount} 廃棄量:${record.throw_amount} 日付:${record.created_at.split('T')[0]}`
  ).join('\n') : 
  '廃棄記録がありません'}

会話履歴：
${allMessages.map(msg => 
  `${msg.isUser ? 'ユーザー' : 'アドバイザー'}: ${msg.text}`
).join('\n')}

ユーザーの追加質問：${userMessage.text}

上記の情報と会話履歴を踏まえて、食品ロス防止の観点から実践的なアドバイスをしてください。
保存方法について不確実な場合は、公式情報の参照を促してください。
`

      const response = await genAI.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: followUpPrompt,
      })

      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response.text ?? 'エラーが発生しました',
        isUser: false,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, aiResponse])
      setAllMessages(prev => [...prev, aiResponse])
      
      // 固定サジェストを復元
      setQuickReplies([
        '消費できるレシピを教えて',
        '使用計画を考えて'
      ])
    } catch (error) {
      console.error('AI応答エラー:', error)
      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'エラーが発生しました。しばらくしてから再度お試しください。',
        isUser: false,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorResponse])
      setAllMessages(prev => [...prev, errorResponse])
    } finally {
      setLoading(false)
    }
  }

  //! ボタンからの質問時
  // 横スクロールのクイック返信ボタンを押したときに実行されるやつ
  const handleQuickReply = async (replyText: string) => {
    if (!replyText.trim()) return

    // ユーザーメッセージを追加
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: replyText,
      isUser: true,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])
    setAllMessages(prev => [...prev, userMessage])
    setLoading(true)
    
    // クイック返信をクリア
    setQuickReplies([])

    try {
      // データベースからデータを取得
      const dbData = getDatabaseData()
      
      // 質問タイプに応じた専用プロンプトを生成
      let followUpPrompt = ''
      
      if (replyText === '消費できるレシピを教えて') {
        followUpPrompt = `
あなたは料理のエキスパートです。以下の食材を使って、簡単で実用的なレシピを提案してください。

【対象食材】
食材名：${diagnosisData.foodName}
購入予定量：${diagnosisData.amount}
${diagnosisData.expiryType === 'best_before' ? '賞味期限' : '消費期限'}：${diagnosisData.expiryDate}
備考：${diagnosisData.notes || 'なし'}

【ユーザープロフィール】
世帯人数：${dbData.profile.household_size}
自炊頻度：${dbData.profile.cooking_frequency}
買い物の頻度：${dbData.profile.shopping_frequency}

【過去の廃棄履歴】
${dbData.wasteRecords.length > 0 ? 
  dbData.wasteRecords.map(record => 
    `食材名:${record.food_name} 購入量:${record.buy_amount} 廃棄量:${record.throw_amount} 日付:${record.created_at.split('T')[0]}`
  ).join('\n') : 
  '廃棄記録がありません'}

【会話履歴】
${allMessages.map(msg => `${msg.isUser ? 'ユーザー' : 'AI'}：${msg.text}`).join('\n')}

【出力要件】

食材を用いたレシピを3つ教えて下さい．
出力は箇条書きにしてそれぞれ100文字以内で記述してください．

【要望】
具体的で実践しやすいレシピを提案してください．

`
      } else if (replyText === '使用計画を考えて') {
        followUpPrompt = `
あなたは食品ロス防止アドバイザーです。以下の食材の効率的な使用計画を立ててください。

【対象食材】
食材名：${diagnosisData.foodName}
購入予定量：${diagnosisData.amount}
${diagnosisData.expiryType === 'best_before' ? '賞味期限' : '消費期限'}：${diagnosisData.expiryDate}
備考：${diagnosisData.notes || 'なし'}

【ユーザープロフィール】
世帯人数：${dbData.profile.household_size}
自炊頻度：${dbData.profile.cooking_frequency}
買い物の頻度：${dbData.profile.shopping_frequency}

【過去の廃棄履歴】
${dbData.wasteRecords.length > 0 ? 
  dbData.wasteRecords.map(record => 
    `食材名:${record.food_name} 購入量:${record.buy_amount} 廃棄量:${record.throw_amount} 日付:${record.created_at.split('T')[0]}`
  ).join('\n') : 
  '廃棄記録がありません'}

【会話履歴】
${allMessages.map(msg => `${msg.isUser ? 'ユーザー' : 'AI'}：${msg.text}`).join('\n')}

【出力要件】

食材の使用計画を提案してください
出力は300文字以内で記述してください．

【要望】

出力要件のみ出力してください．

`
      } else {
        // デフォルトのプロンプト（将来的に他の質問が追加される場合）
        followUpPrompt = `
あなたは食品ロス防止アドバイザーです。

前回の診断対象:
食材名：${diagnosisData.foodName}
購入予定量：${diagnosisData.amount}
${diagnosisData.expiryType === 'best_before' ? '賞味期限' : '消費期限'}：${diagnosisData.expiryDate}
備考：${diagnosisData.notes || 'なし'}

【プロフィール情報】
世帯人数：${dbData.profile.household_size}
自炊頻度：${dbData.profile.cooking_frequency}
買い物の頻度：${dbData.profile.shopping_frequency}

【廃棄経歴】
過去の廃棄記録全履歴：
${dbData.wasteRecords.length > 0 ? 
  dbData.wasteRecords.map(record => 
    `食材名:${record.food_name} 購入量:${record.buy_amount} 廃棄量:${record.throw_amount} 日期:${record.created_at.split('T')[0]}`
  ).join('\n') : 
  '廃棄記録がありません'}

【会話履歴】
${allMessages.map(msg => `${msg.isUser ? 'ユーザー' : 'AI'}：${msg.text}`).join('\n')}

【新しい質問】
${replyText}

上記の情報に基づいて、ユーザーの質問に具体的で実用的な回答をしてください。
`
      }

      const response = await genAI.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: followUpPrompt,
      })

      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response.text ?? 'エラーが発生しました',
        isUser: false,
        timestamp: new Date(),
      }
      // messageに追加したのでsliceでチャットのUIが更新される
      setMessages(prev => [...prev, aiResponse])
      setAllMessages(prev => [...prev, aiResponse])
      
      // 固定サジェストを復元
      setQuickReplies([
        '消費できるレシピを教えて',
        '使用計画を考えて'
      ])
    } catch (error) {
      console.error('AI応答エラー:', error)
      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'エラーが発生しました。しばらくしてから再度お試しください。',
        isUser: false,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorResponse])
      setAllMessages(prev => [...prev, errorResponse])
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    // 会話履歴がある場合のみAlertを表示
    if (messages.length > 0) {
      Alert.alert(
        '確認',
        '戻ると現在の会話履歴が失われます',
        [
          {
            text: 'キャンセル',
            style: 'cancel'
          },
          {
            text: '戻る',
            style: 'destructive',
            onPress: () => router.back()
          }
        ]
      )
    } else {
      // 会話履歴がない場合は直接戻る
      router.back()
    }
  }



  // メッセージのオブジェクト入れたらAIかユーザーかによってチャットのui作ってくれるやつ
  const renderMessage = (message: ChatMessage) => (
    <View
      key={message.id}
      style={[
        styles.messageContainer,
        message.isUser ? styles.userMessage : styles.aiMessage
      ]}
    >
      {!message.isUser && (
        <View style={styles.aiIcon}>
          <Text style={styles.aiIconText}>AI</Text>
        </View>
      )}
      <View style={[
        styles.messageBubble,
        message.isUser ? styles.userBubble : styles.aiBubble
      ]}>
        {message.isUser ? (
          <Text style={[
            styles.messageText,
            styles.userText
          ]}>
            {message.text}
          </Text>
        ) : (
          <Text style={[styles.messageText, styles.aiText]}>
            <Markdown style={markdownStyles}>
              {removeJSONFromResponse(message.text)}
            </Markdown>
          </Text>
        )}
        <Text style={message.isUser ? styles.usertimestamp : styles.aitimestamp}>
          {message.timestamp.toLocaleTimeString('ja-JP', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
      </View>
    </View>
  )
  //! UI ここから
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>← 入力画面へ</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={{
          paddingBottom: keyboardVisible ? 50 : 120, // キーボードの開閉によって下の空白を調整
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* 診断結果カード */}
        <View style={styles.diagnosisCard}>
          <Text style={styles.diagnosisLabel}>購入診断</Text>
          <View style={styles.diagnosisContent}>
            <Text style={styles.foodInfo}>食材: {diagnosisData.foodName}</Text>
            <Text style={styles.foodInfo}>内容量: {diagnosisData.amount}</Text>
            <Text style={styles.expiryInfo}>
              {diagnosisData.expiryType === 'best_before' ? '賞味期限' : '消費期限'}: {diagnosisData.expiryDate}
            </Text>
            {diagnosisData.notes && <Text style={styles.noteInfo}>備考: {diagnosisData.notes}</Text>}
          </View>
        </View>

        {/* AI分析結果カード */}
        <View style={styles.aiRecommendationCard}>
          <View style={styles.aiHeaderContainer}>
            <View style={styles.aiIcon}>
              <Text style={styles.aiIconText}>AI</Text>
            </View>
            {!isAnalyzing && messages[0]?.text && (
              <View style={styles.recommendationContainer}>
                {/* <Text style={styles.recommendationLabel}>購入オススメ度</Text> */}
                <Image 
                  source={getRecommendationIcon(extractRecommendationFromJSON(messages[0].text))}
                  style={styles.recommendationIcon}
                  contentFit="fill"
                />
              </View>
            )}
          </View>
          {isAnalyzing ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>AI分析中...</Text>
              <ActivityIndicator size="large" color="#2563eb" />
            </View>
          ) : (
            <Markdown style={markdownStyles}>
              {removeJSONFromResponse(messages[0]?.text || '') || 'AI分析結果がここに表示されます'}
            </Markdown>
          )}
        </View>

        {/* 追加のチャットメッセージ */}
        {/* AI初手回答からmessageに記録されていってslice(1)（sliceは非破壊）によって初手以降のメッセージをレンダリングしてくれて次々表示してくれる */}
        {messages.slice(1).map(renderMessage)}
        {loading && (
          <View style={styles.loadingContainer}>
            <View style={styles.aiIcon}>
              <Text style={styles.aiIconText}>AI</Text>
            </View>
            <View style={styles.aiBubble}>
              <Text style={styles.loadingText}>考え中...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[
        styles.inputContainer,
        keyboardVisible && styles.inputContainerWithKeyboard
      ]}>
        {/* クイック返信ボタンのUI（横スクロール可 */}
        {quickReplies.length > 0 && (
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.quickRepliesContainer}
            contentContainerStyle={styles.quickRepliesContent}
          >
            {quickReplies.map((reply, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickReplyButton}
                onPress={() => handleQuickReply(reply)}
                disabled={loading}
              >
                <Text style={styles.quickReplyText}>{reply}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        
        <View style={styles.inputRow}>
          <TextInput
            style={styles.questionInput}
            value={question}
            onChangeText={setQuestion}
            placeholder="AIに質問"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, !question.trim() && styles.sendButtonDisabled]}
            onPress={handleSendQuestion}
            disabled={!question.trim() || loading}
          >
            <Text style={styles.sendButtonText}>送信</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.cautionText}>
          AIの回答は正しいとは限りません。{'\n'}重要な情報は確認するようにしてください。
        </Text>
      </View>
    </SafeAreaView>
  )
  //! UI ここまで
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#039ADA',
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  diagnosisCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  diagnosisLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#20556C',
    marginBottom: 12,
  },
  diagnosisContent: {
    gap: 4,
  },
  foodInfo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#20556C',
  },
  expiryInfo: {
    fontSize: 14,
    color: '#ABC5D0',
  },
  noteInfo: {
    fontSize: 14,
    color: '#4a5568',
  },
  aiRecommendationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiIcon: {
    backgroundColor: '#039ADA',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiIconText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  aiRecommendationText: {
    fontSize: 14,
    color: '#2d3748',
    lineHeight: 20,
    marginBottom: 12,
  },
  reasonButton: {
    alignSelf: 'flex-start',
  },
  reasonButtonText: {
    color: '#6b7280',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  aiMessage: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#2563eb',
    marginLeft: 'auto',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  userText: {
    color: 'white',
  },
  aiText: {
    color: '#20556C',
  },
  usertimestamp: {
    fontSize: 10,
    color: '#e2e8f0',
    alignSelf: 'flex-start',
  },
  aitimestamp: {
    fontSize: 10,
    color: '#6b7280',
    alignSelf: 'flex-end',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  inputContainer: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 70, 
  },
  inputContainerWithKeyboard: {
    paddingBottom: 350, // キーボード開閉時に重ならないようにひょいっと上がるやつの余白
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  questionInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    maxHeight: 100,
    color: '#20556C',
  },
  sendButton: {
    backgroundColor: '#039ADA',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  quickRepliesContainer: {
    marginBottom: 12,
    paddingVertical: 8,
  },
  quickRepliesContent: {
    paddingHorizontal: 4,
    gap: 8,
  },
  quickReplyButton: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
  },
  quickReplyText: {
    color: '#20556C',
    fontSize: 14,
    fontWeight: '500',
  },
  cautionText: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 16,
    color: '#6b7280',
    opacity: 0.7,
  },
  starContainer: {
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  starLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    fontSize: 16,
    marginHorizontal: 2,
  },
  starFilled: {
    color: '#3b82f6',
  },
  starEmpty: {
    color: '#e2e8f0',
  },
  aiHeaderContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  recommendationContainer: {
    alignItems: 'center',
    marginTop: 8,
    width: '100%',
  },
  recommendationLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 4,
  },
  recommendationIcon: {
    width: "100%",
    height: 50,
  },
})

// Markdownスタイル
const markdownStyles = {
  body: {
    fontSize: 14,
    lineHeight: 20,
    color: '#20556C',
  },
  heading1: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#20556C',
  },
  heading2: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#20556C',
  },
  paragraph: {
    marginBottom: 8,
    lineHeight: 18,
  },
  strong: {
    fontWeight: '600' as const,
    color: '#20556C',
  },
  list_item: {
    marginBottom: 4,
  },
  bullet_list: {
    marginBottom: 12,
  },
  code_inline: {
    backgroundColor: '#f0f0f0',
    padding: 2,
    borderRadius: 4,
    fontFamily: 'monospace',
    color: '#20556C',
  },
}
