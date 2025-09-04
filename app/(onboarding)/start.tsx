import { Image } from 'expo-image';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colors } from '@/constants/Colors';
import StepIndicator from '@components/StepIndicator';
import { useRouter } from 'expo-router';

const router = useRouter();

export default function Profile1Screen() {
  return (
    <View style={styles.container}>

      {/* コンテンツ部分 */}
      <View style={styles.card}>
        {/* ステップのドット */}
        <StepIndicator totalSteps={4} currentStep={1} />

        <Text style={styles.title}></Text>

        {/* メッセージ */}
        <Text style={styles.title}>
          まずは簡単なプロフィールを設定してみましょう。
        </Text>
        <View style={styles.textBlock}>
          <Text style={styles.subText}>・パーソナライズされた提案</Text>
          <Text style={styles.subText}>・AIによる適切な購入診断</Text>
        </View>
        {/* イラスト */}
        <Image
          source={require('@/assets/images/food.png')} // ここは用意した画像に変更
          style={styles.image}
        />

        {/* ボタン */}
        <TouchableOpacity 
        style={styles.button}
        onPress={() => router.push('/question1')}  // ← 遷移処理を追加
      >    
        <Text style={styles.buttonText}>プロフィール設定を始める</Text>
        </TouchableOpacity>
        <Text style={styles.note}>※設定はいつでも変更できます。</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f8',
    alignItems: 'center',
    paddingTop: 40,
    height: '100%',
    width: '100%',
  },
  dateWrapper: {
    backgroundColor: Colors.light.primary,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 6,
    marginBottom: 20,
  },
  dateText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    alignItems: 'center',
    elevation: 3,
  },
  stepWrapper: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: Colors.light.primary,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  textBlock: {
    alignItems: "flex-start", // ブロック内では左揃え
  },
  subText: {
    fontSize: 14,
    color: '#B4C5C5',
    marginVertical: 4
  },
  image: {
    width: 120,
    height: 120,
    marginVertical: 16,
  },
  button: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    marginVertical: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  note: {
    fontSize: 12,
    color: '#888',
  },
});