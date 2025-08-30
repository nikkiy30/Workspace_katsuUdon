import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, TouchableOpacity } from 'react-native';

export default function FeedbackScreen() {
  return (
    <ThemedView style={styles.container}>
      <StatusBar style="dark" backgroundColor="#fafeff" />
      <ThemedView style={styles.content}>
        <ThemedText type="title" style={styles.title}>保存しました</ThemedText>
        <ThemedText style={styles.message}>
          後ほどフィードバックをご用意します。引き続きご利用ください。
        </ThemedText>
        <TouchableOpacity style={styles.button} onPress={() => router.replace('/(tabs)')}>
          <ThemedText style={styles.buttonText}>ホームに戻る</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '86%',
    alignItems: 'center',
  },
  title: {
    marginBottom: 12,
  },
  message: {
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 2,
    borderRadius: 6,
    borderColor: '#156486',
    backgroundColor: '#1564861a',
  },
  buttonText: {
    fontWeight: '600',
    color: '#156486',
    fontSize: 16,
  },
});

