import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useOnboarding } from '@/hooks/useOnboarding';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import {
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

const cookingOptions = [
  'ほとんどしない',
  '週1回',
  '週2回',
  '週3回',
  '週4回',
  '週5回',
  '週6回',
  '毎日',
];

export default function Question2() {
  const { answers, updateAnswer } = useOnboarding();
  const selectedOption = answers.cookingFrequency;

  const handleNext = () => {
    if (selectedOption) {
      router.push('/(onboarding)/question3');
    }
  };

  const handleOptionSelect = (option: string) => {
    updateAnswer('cookingFrequency', option);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        {/* 左矢印 */}
        <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBack}
          >
          <ArrowLeft size={24} color="#156486" />
        </TouchableOpacity>

        <View style={styles.stepperContainer}>
          <View style={[styles.stepDot, styles.stepDotActive]} />
          <View style={styles.stepLineActive} />
          <View style={[styles.stepDot, styles.stepDotActive]} />
          <View style={styles.stepLineActive} />
          <View style={[styles.stepDot, styles.stepDotActive]} />
          <View style={styles.stepLine} />
          <View style={styles.stepDot} />
        </View>

        {/* Question */}
        <ThemedText style={styles.questionTitle}>
          Q2. 自炊の頻度を教えて下さい
        </ThemedText>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {cookingOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                selectedOption === option && styles.optionButtonSelected
              ]}
              onPress={() => handleOptionSelect(option)}
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
              次へ　＞
            </ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 50,
    display: 'flex',
    justifyContent: 'center',
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e5e7eb',
  },
  stepLine: {
    width: 32,
    height: 2,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 8,
  },
  stepDotActive: {
    backgroundColor: Colors.light.primary,
  },
  stepLineActive: {
    width: 32,
    height: 2,
    marginHorizontal: 8,
    backgroundColor: Colors.light.primary,
  },
  container: {
    flex: 1,
    backgroundColor: '#fafeff',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
  },
  questionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#20556C',
    textAlign: 'center',
    marginBottom: 0,
  },
  optionsContainer: {
    flex: 1,
    paddingTop: 0,
    paddingHorizontal: 20,
    justifyContent: 'center',
    marginBottom: 40,
  },
  optionButton: {
    backgroundColor: Colors.light.base,
    borderWidth: 1.5,
    borderColor: Colors.light.textSecondary,
    borderRadius: 25,
    paddingVertical: 4,
    paddingHorizontal: 24,
    marginBottom: 6,
    alignItems: 'center',
    marginHorizontal: 40,
    marginVertical: 12,
  },
  optionButtonSelected: {
    borderColor: Colors.light.primary,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.textSecondary,
  },
  optionTextSelected: {
    color: Colors.light.primary,
  },
  buttonContainer: {
    paddingBottom: 20,
    paddingHorizontal: 40,
  },
  nextButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 18,
    paddingVertical: 12,
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
