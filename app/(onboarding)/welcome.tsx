import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { router } from 'expo-router';
import { ArrowRight, ChefHat } from 'lucide-react-native';
import {
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';

export default function WelcomeScreen() {
  const goToQ1 = () => {
    router.push('/(onboarding)/question1')
  }

  return (
    <ThemedView style={styles.container}>
      {/* <SafeAreaView style={styles.safeArea}> */}
        {/* Background decoration */}
        {/* <View style={styles.backgroundCircle1} />
        <View style={styles.backgroundCircle2} /> */}
        
        <View style={styles.content}>
          {/* Logo/Icon area */}
          <View style={styles.iconContainer}>
            <View style={styles.iconBackground}>
              <ChefHat size={48} color="#156486" />
            </View>
          </View>

          {/* Welcome Text */}
          <View style={styles.textContainer}>
            <ThemedText style={styles.title}>
              Chopへようこそ！
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              {/* Chopへ */}
            </ThemedText>

            {/* Description */}
            <ThemedText style={styles.description}>
              あなたの食生活をもっと楽しく{'\n'}
              もっと廃棄を少なく{'\n'}
              簡単な質問からはじめましょう
            </ThemedText>
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <View style={styles.featureDot} />
              <ThemedText style={styles.featureText}>
                パーソナライズされた提案
              </ThemedText>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureDot} />
              <ThemedText style={styles.featureText}>
                AI による適切な購入診断
              </ThemedText>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureDot} />
              <ThemedText style={styles.featureText}>
                シンプルなデザインで使いやすい
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Start Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={goToQ1}>
            <ThemedText style={styles.buttonText}>はじめる</ThemedText>
            <ArrowRight size={20} color="#fafeff" />
          </TouchableOpacity>
        </View>
      {/* </SafeAreaView> */}
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafeff',
    margin:10,
  },
  safeArea: {
    flex: 1,
    // position: 'relative',
  },
  backgroundCircle1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#156486',
    opacity: 0.1,
  },
  backgroundCircle2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#156486',
    opacity: 0.05,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 40,
  },
  iconContainer: {
    // position: 'relative',
    marginBottom: 60,
  },
  iconBackground: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#156486',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  sparkleContainer: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    elevation: 4,
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 30,
    padding: 12,
    fontWeight: '700',
    color: '#156486',
    textAlign: 'center',
    // borderWidth:1,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#666666',
    marginBottom: 32,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 0,
    maxWidth: 280,
  },
  featuresContainer: {
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#156486',
  },
  featureText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  buttonContainer: {
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  button: {
    backgroundColor: '#156486',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 16,
    gap: 8,
    elevation: 8,
    shadowColor: '#156486',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  buttonText: {
    color: '#fafeff',
    fontSize: 18,
    fontWeight: '600',
  },
});
