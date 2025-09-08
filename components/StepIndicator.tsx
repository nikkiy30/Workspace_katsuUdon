import { StyleSheet, View } from 'react-native';

type Props = {
  totalSteps: number;
  currentStep: number; // 1始まりで管理 (1, 2, 3, 4 ...)
};

export default function StepIndicator({ totalSteps, currentStep }: Props) {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }).map((_, i) => {
        const isActive = i + 1 === currentStep;
        return (
          <View key={i} style={[styles.dot, isActive && styles.activeDot]}>
            {/* ドットの右に線を引く（最後以外） */}
            {i < totalSteps - 1 && <View style={styles.line} />}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#B0BEC5', // グレー
    marginHorizontal: 4,
    position: 'relative',
  },
  activeDot: {
    backgroundColor: '#039BE5', // 青
  },
  line: {
    position: 'absolute',
    top: '50%',
    left: '100%',
    width: 24,
    height: 2,
    backgroundColor: '#B0BEC5',
  },
});