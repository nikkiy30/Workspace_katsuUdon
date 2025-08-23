import { GoogleGenAI } from '@google/genai'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native'
import Markdown from 'react-native-markdown-display'

interface ChatMessage {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

// Gemini APIの設定
const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || ''
const genAI = new GoogleGenAI({ apiKey })

export default function AiChatScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const [question, setQuestion] = useState('')
  const [aiAnalysis, setAiAnalysis] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  // 前の画面から受け取った診断データ
  const diagnosisData = {
    foodName: params.foodName as string || '',
    amount: params.amount as string || '',
    expiryDate: params.expiryDate as string || '',
    notes: params.notes as string || ''
  }
  
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)

  // 初回読み込み時にAI分析を実行
  useEffect(() => {
    if (diagnosisData.foodName && diagnosisData.amount) {
      performAIAnalysis()
    }
  }, [])

  // AI分析を実行する関数
  const performAIAnalysis = async () => {
    setIsAnalyzing(true)
    try {
      const prompt = `
あなたはAIアシスタントです。
日本語で簡潔に回答してください。
専門用語を使う場合は分かりやすく説明してください。

前提条件:
{
    "foodName": "${diagnosisData.foodName}",
    "amount": "${diagnosisData.amount}",
    "expiryDate": "${diagnosisData.expiryDate}",
    "notes": "${diagnosisData.notes}",
    "summary": {
        "waste_count_last_month": 2,
        "waste_frequency_category": "高頻度",
        "average_waste_rate": 0.35,
        "max_waste_rate": 0.8,
        "days_since_last_discard": 12,
        "is_improving_trend": false,
        "most_common_purchase_unit": "個",
        "user_profile_summary": {
            "cooking_frequency": "週1-2回",
            "family_size": "一人暮らし"
        }
    }
}
これを元に、以下の出力形式で回答してください
- タイトル（判断を短く）
- 詳細（判断の説明を長過ぎない程度に説明）
- 根拠（「前提条件」の変数名は表示しないで説明してください）
- アドバイス（仮に分析結果から使い切れる可能性が低くて廃棄してしまいそうだけどこのようにすれば、このような料理を作ってみませんか？とかその食材なら長持ちする保存方法とか結果を提示するだけじゃなくて改善に迎えるような役に立つアドバイスとかあった良いかも）
`

      const response = await genAI.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: prompt,
      })

      const analysisResult = response.text ?? 'エラーが発生しました'
      setAiAnalysis(analysisResult)
      
      // 初期メッセージとしてAI分析結果を追加
      setMessages([{
        id: '1',
        text: analysisResult,
        isUser: false,
        timestamp: new Date(),
      }])
    } catch (error) {
      console.error('AI分析エラー:', error)
      setAiAnalysis('エラーが発生しました: ' + error)
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
    setMessages(prev => [...prev, userMessage])
    setQuestion('')
    setLoading(true)

    try {
      // Gemini APIで追加質問に答える
      const followUpPrompt = `
前回の分析対象:
- 食材: ${diagnosisData.foodName}
- 内容量: ${diagnosisData.amount}
- 賞味期限: ${diagnosisData.expiryDate}
- 備考: ${diagnosisData.notes}

ユーザーの追加質問: ${userMessage.text}

上記の食材と関連して、ユーザーの質問に日本語で簡潔に答えてください。実用的なアドバイスを提供してください。
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
    } catch (error) {
      console.error('AI応答エラー:', error)
      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'エラーが発生しました。しばらくしてから再度お試しください。',
        isUser: false,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorResponse])
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.back()
  }

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
        <Text style={[
          styles.messageText,
          message.isUser ? styles.userText : styles.aiText
        ]}>
          {message.text}
        </Text>
        <Text style={styles.timestamp}>
          {message.timestamp.toLocaleTimeString('ja-JP', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
      </View>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>← 入力画面へ</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
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

      <View style={styles.inputContainer}>
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
  timestamp: {
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
    paddingBottom: 100, // タブバーと重ならないように
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
