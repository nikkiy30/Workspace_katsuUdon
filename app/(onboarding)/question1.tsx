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

const householdOptions = [
  '1人',
  '2人', 
  '3人',
  '4人',
  '5人',
  '6人',
  '7人以上',
];

export default function Question1() {
  const { answers, updateAnswer } = useOnboarding();
  const selectedOption = answers.householdSize;

  const handleNext = () => {
    if (selectedOption) {
      router.push('/(onboarding)/question2');
    }
  };

  const handleOptionSelect = (option: string) => {
    updateAnswer('householdSize', option);
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
          <View style={styles.stepLine} />
          <View style={styles.stepDot} />
          <View style={styles.stepLine} />
          <View style={styles.stepDot} />
          <View style={styles.stepLine} />
          <View style={styles.stepDot} />
        </View>

        {/* Question */}
        <ThemedText style={styles.questionTitle}>
          Q1. 世帯人数を教えて下さい
        </ThemedText>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {householdOptions.map((option, index) => (
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
              次へ
            </ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  stepperContainer: {
    flexDirection: 'row', // 子要素を横並びにする
    alignItems: 'center', // 子要素を垂直方向の中央に揃える
    marginTop: 20,
    marginBottom: 50,
    display: 'flex',
    justifyContent: 'center',
  },
  backButton: {
    marginLeft: 10,
    padding: 8,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6, // 円形にする
    backgroundColor: '#e5e7eb', // 非アクティブな点の色
  },
  stepDotActive: {
    backgroundColor: Colors.light.primary,
  },
  stepLine: {
    width: 32,
    height: 2,
    backgroundColor: '#e5e7eb', // 点の間の線の色
    marginHorizontal: 8,
  },
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
    color: Colors.light.primary,
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginBottom: 30,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: 2,
  },
  questionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#20556C',
    textAlign: 'center',
    marginBottom: 30,
  },
  optionsContainer: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
    // borderWidth:1,
    justifyContent: 'center',
  },
  optionButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  optionButtonSelected: {
    backgroundColor: Colors.light.primary,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.primary,
  },
  optionTextSelected: {
    color: '#fafeff',
  },
  buttonContainer: {
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  nextButton: {
    backgroundColor: Colors.light.primary,
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