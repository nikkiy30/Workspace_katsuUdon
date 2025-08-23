import { useRouter } from 'expo-router'
import { useState } from 'react'
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'

interface ChatMessage {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

export default function AiChatScreen() {
  const router = useRouter()
  const [question, setQuestion] = useState('')
  
  // モックの診断データ（実際は前の画面から受け取る）
  const diagnosisData = {
    foodName: 'M 10個の卵',
    expiryDate: '2025/9/3',
    notes: '今日3個使う予定'
  }
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: '2025/8/22〜2025/9/3でM 10個の卵を使い切れる可能性は高いです。',
      isUser: false,
      timestamp: new Date(),
    }
  ])
  const [loading, setLoading] = useState(false)

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
      // TODO: 実際のAI APIを呼び出す
      // 現在はモックレスポンス
      setTimeout(() => {
        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: `「${userMessage.text}」についてですね。食材の保存や購入に関するアドバイスをさせていただきます。\n\n例えば、卵の場合は冷蔵庫で約3週間保存可能ですが、賞味期限内に使い切ることをお勧めします。この機能は現在開発中です。`,
          isUser: false,
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, aiResponse])
        setLoading(false)
      }, 1500)
    } catch (error) {
      Alert.alert('エラー', 'AI応答の取得に失敗しました')
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
            <Text style={styles.foodInfo}>{diagnosisData.foodName}</Text>
            <Text style={styles.expiryInfo}>賞味期限{diagnosisData.expiryDate}</Text>
            <Text style={styles.noteInfo}>備考：{diagnosisData.notes}</Text>
          </View>
        </View>

        {/* AI推奨カード */}
        <View style={styles.aiRecommendationCard}>
          <View style={styles.aiHeader}>
            <View style={styles.aiIcon}>
              <Text style={styles.aiIconText}>AI</Text>
            </View>
          </View>
          <Text style={styles.aiRecommendationText}>
            {messages[0]?.text}
          </Text>
          <TouchableOpacity style={styles.reasonButton}>
            <Text style={styles.reasonButtonText}>理由を見る</Text>
          </TouchableOpacity>
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
