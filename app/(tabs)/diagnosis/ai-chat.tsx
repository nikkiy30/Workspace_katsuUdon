import { UserDB } from '@/database/db/Userdb'
import { WasteDB } from '@/database/db/Wastedb'
import { GoogleGenAI } from '@google/genai'
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
    notes: params.notes as string || ''
  }
  // messageはユーザーの初手メッセージ以外を記録（チャットののUIレンダリングに使用するためのやつ)
  // 全メッセージを記録してAIのプロンプトに使うので格納
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [allMessages, setAllMessages] = useState<ChatMessage[]>([])

  // 初回読み込み時にAI分析を実行(.onappear)
  useEffect(() => {
    if (diagnosisData.foodName && diagnosisData.amount) {
      performAIAnalysis()
    }
  }, [])

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

【その他】
現在の季節から、食品の劣化の可能性が検討される場合は出力に活用してください。

以下の形式で出力してください：

◆ 結論
購入推奨度：（「購入してもいい」「条件付きでOK」「おすすめしない」の3段階）
理由：（上記のプロフィール情報と廃棄経歴に基づく）

◆ 詳細なアドバイス
気をつけるポイント：（量・期限・調理計画に基づく）
保存方法：（安全が担保できない場合は「安全な保存情報が確認できません。公式情報を参照してください。」と明示）
代替案：（購入の代替案）

【安全ルール】
保存方法について、不確実な情報は推測しない。
安全が担保できない場合は、国の食品安全基準や公式サイトの参照を促す。
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
      setIsAnalyzing(false)
    }
  }

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
    if (messages.length > 1) {
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
              {message.text}
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
            <Text style={styles.expiryInfo}>賞味期限: {diagnosisData.expiryDate}</Text>
            {diagnosisData.notes && <Text style={styles.noteInfo}>備考: {diagnosisData.notes}</Text>}
          </View>
        </View>

        {/* AI分析結果カード */}
        <View style={styles.aiRecommendationCard}>
          <View style={styles.aiHeader}>
            <View style={styles.aiIcon}>
              <Text style={styles.aiIconText}>AI</Text>
            </View>
          </View>
          {isAnalyzing ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>AI分析中...</Text>
              <ActivityIndicator size="large" color="#2563eb" />
            </View>
          ) : (
            <Markdown style={markdownStyles}>
              {messages[0]?.text || 'AI分析結果がここに表示されます'}
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
    color: '#2563eb',
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
    borderColor: '#2563eb',
  },
  diagnosisLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 12,
  },
  diagnosisContent: {
    gap: 4,
  },
  foodInfo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  expiryInfo: {
    fontSize: 14,
    color: '#4a5568',
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
    backgroundColor: '#2563eb',
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
    color: '#2d3748',
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
    paddingBottom: 100, 
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
  },
  sendButton: {
    backgroundColor: '#2563eb',
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
})

// Markdownスタイル
const markdownStyles = {
  body: {
    fontSize: 14,
    lineHeight: 20,
    color: '#2d3748',
  },
  heading1: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1a202c',
  },
  heading2: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a202c',
  },
  paragraph: {
    marginBottom: 8,
    lineHeight: 18,
  },
  strong: {
    fontWeight: '600' as const,
    color: '#1a202c',
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
  },
}
