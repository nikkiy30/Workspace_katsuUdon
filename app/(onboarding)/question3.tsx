import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

const shoppingOptions = [
  '特に決めてない',
  '週1回',
  '週2回',
  '週3回',
  '週4回',
  '週5回',
  '週6回',
  '毎日',
];

export default function Question3() {
  const [selectedOption, setSelectedOption] = useState<string>('');

  const handleNext = () => {
    if (selectedOption) {
      // TODO: 回答を保存してプロフィールに反映
      router.push('/(tabs)');
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBack}
          >
            <ArrowLeft size={24} color="#156486" />
          </TouchableOpacity>
          <ThemedText style={styles.progressText}>3/3</ThemedText>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: '100%' }]} />
        </View>

        {/* Question */}
        <ThemedText style={styles.questionTitle}>
          Q3. 買い物の頻度を教えて下さい
        </ThemedText>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {shoppingOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                selectedOption === option && styles.optionButtonSelected
              ]}
              onPress={() => setSelectedOption(option)}
            >
              <ThemedText
                style={[
                  styles.optionText,
                  selectedOption === option && styles.optionTextSelected
                ]}
              >
                {option}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Next Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.nextButton,
              !selectedOption && styles.nextButtonDisabled
            ]}
            onPress={handleNext}
            disabled={!selectedOption}
          >
            <ThemedText
              style={[
                styles.nextButtonText,
                !selectedOption && styles.nextButtonTextDisabled
              ]}
            >
              アプリを始める
            </ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafeff',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#156486',
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginBottom: 30,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#156486',
    borderRadius: 2,
  },
  questionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#156486',
    textAlign: 'center',
    marginBottom: 30,
  },
  optionsContainer: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  optionButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1.5,
    borderColor: '#156486',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  optionButtonSelected: {
    backgroundColor: '#156486',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#156486',
  },
  optionTextSelected: {
    color: '#fafeff',
  },
  buttonContainer: {
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  nextButton: {
    backgroundColor: '#156486',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fafeff',
  },
  nextButtonTextDisabled: {
    color: '#666666',
  },
});
