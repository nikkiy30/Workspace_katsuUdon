import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface Occupation {
  id: string;
  label: string;
  selected?: boolean;
}

interface ProgressDot {
  active: boolean;
}

const App: React.FC = () => {
  const [selectedOccupation, setSelectedOccupation] = useState<string>('職業');

  const occupations: Occupation[] = [
    { id: 'student', label: '学生' },
    { id: 'housewife', label: '専業主婦' },
    { id: 'parttime', label: 'パート・\nアルバイト' },
    { id: 'occupation', label: '職業', selected: true },
    { id: 'civil', label: '公務員' },
    { id: 'selfemployed', label: '自営業' },
    { id: 'others', label: 'その他' },
  ];

  const progressDots: ProgressDot[] = [
    { active: true },
    { active: false },
    { active: false },
    { active: false },
  ];

  const handleOccupationSelect = (occupationId: string) => {
    setSelectedOccupation(occupationId);
    useRouter().push('/(onboarding)/question2');
  };

  const HexagonButton: React.FC<{
    occupation: Occupation;
    onPress: () => void;
  }> = ({ occupation, onPress }) => (
    <TouchableOpacity
      style={styles.hexagonContainer}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`職業選択: ${occupation.label}`}
      accessibilityHint="タップして選択してください"
    >
      <View
        style={[
          styles.hexagon,
          occupation.selected || selectedOccupation === occupation.id
            ? styles.hexagonSelected
            : styles.hexagonDefault,
        ]}
      >
        <Text
          style={[
            styles.hexagonText,
            occupation.selected || selectedOccupation === occupation.id
              ? styles.hexagonTextSelected
              : styles.hexagonTextDefault,
          ]}
        >
          {occupation.label}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fafeff" />
      
      {/* Main Background */}
      <View style={styles.mainBackground}>
        {/* Header with notification bell */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.notificationButton}
            accessibilityRole="button"
            accessibilityLabel="通知"
          >
            <Ionicons name="notifications" size={22} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Date Badge */}
        <View style={styles.dateBadge}>
          <Text style={styles.dateText}>8/21(木)</Text>
        </View>

        {/* Main Content Cards */}
        <View style={styles.contentArea}>
          <View style={styles.mainCard}>
            <Text style={styles.cardText}>廃棄量、節約量の成果？</Text>
          </View>

          <View style={styles.calendarCard}>
            <Text style={styles.cardText}>カレンダーor本日の予定</Text>
          </View>

          {/* Bottom Action Cards */}
          <View style={styles.actionCardsContainer}>
            <TouchableOpacity
              style={styles.actionCard}
              accessibilityRole="button"
              accessibilityLabel="AI買い物診断"
            >
              <Text style={styles.actionCardText}>AI買い物診断</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              accessibilityRole="button"
              accessibilityLabel="廃棄入力"
            >
              <Text style={styles.actionCardText}>廃棄入力</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Navigation */}
        <View style={styles.bottomNavigation}>
          <TouchableOpacity style={styles.navItem} accessibilityRole="button">
            <Ionicons name="home" size={24} color="#fafeff" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navItem} accessibilityRole="button">
            <View style={styles.aiButton}>
              <Text style={styles.aiButtonText}>AI</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navItem} accessibilityRole="button">
            <Ionicons name="menu" size={24} color="#fafeff" />
          </TouchableOpacity>
        </View>

        {/* Modal Overlay */}
        <View style={styles.modalOverlay}>
          {/* Survey Modal */}
          <View style={styles.surveyModal}>
            <ScrollView contentContainerStyle={styles.modalContent}>
              {/* Progress Indicator */}
              <View style={styles.progressContainer}>
                <View style={styles.progressLine} />
                {progressDots.map((dot, index) => (
                  <View
                    key={index}
                    style={[
                      styles.progressDot,
                      dot.active ? styles.progressDotActive : styles.progressDotInactive,
                      { left: 67 + (index * 75) },
                    ]}
                  />
                ))}
              </View>

              {/* Question */}
              <Text style={styles.questionText}>
                Q1.ご自身の職業を教えてください。
              </Text>

              {/* Occupation Selection Grid */}
              <View style={styles.occupationGrid}>
                {occupations.map((occupation) => (
                  <HexagonButton
                    key={occupation.id}
                    occupation={occupation}
                    onPress={() => handleOccupationSelect(occupation.id)}
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafeff',
  },
  mainBackground: {
    flex: 1,
    width: screenWidth,
    height: screenHeight,
    backgroundColor: '#fafeff',
    position: 'relative',
  },
  header: {
    position: 'absolute',
    top: 24,
    right: 29,
    zIndex: 10,
  },
  notificationButton: {
    width: 41,
    height: 41,
    backgroundColor: '#156486',
    borderRadius: 20.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateBadge: {
    position: 'absolute',
    top: 103,
    left: 29,
    width: 198,
    height: 48,
    backgroundColor: '#156486',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateText: {
    fontFamily: 'System',
    fontWeight: '600',
    color: '#fafeff',
    fontSize: 24,
    textAlign: 'center',
  },
  contentArea: {
    position: 'absolute',
    top: 169,
    left: 29,
    right: 29,
  },
  mainCard: {
    width: screenWidth - 58,
    height: 216,
    backgroundColor: '#d9d9d9',
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#156486',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 19,
  },
  calendarCard: {
    width: screenWidth - 58,
    height: 101,
    backgroundColor: '#d9d9d9',
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#156486',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardText: {
    fontFamily: 'System',
    fontSize: 20,
    color: '#fafeff',
    textAlign: 'center',
  },
  actionCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: 154,
    height: 100,
    backgroundColor: '#fafeff',
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#156486',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionCardText: {
    fontFamily: 'System',
    fontWeight: '600',
    color: '#156486',
    fontSize: 20,
    textAlign: 'center',
  },
  bottomNavigation: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 79,
    backgroundColor: '#156486',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  navItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiButton: {
    width: 43,
    height: 27,
    backgroundColor: '#fafeff',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiButtonText: {
    fontFamily: 'System',
    fontSize: 20,
    color: '#156486',
    fontWeight: 'normal',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(16, 20, 32, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  surveyModal: {
    width: screenWidth - 31,
    height: 592,
    backgroundColor: '#fafeff',
    borderRadius: 15,
    marginHorizontal: 15.5,
  },
  modalContent: {
    padding: 20,
    alignItems: 'center',
  },
  progressContainer: {
    width: 229,
    height: 20,
    marginTop: 51,
    marginBottom: 40,
    position: 'relative',
  },
  progressLine: {
    position: 'absolute',
    top: 5,
    left: 0,
    width: 229,
    height: 4,
    backgroundColor: '#b4c4c5',
  },
  progressDot: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    top: 0,
  },
  progressDotActive: {
    backgroundColor: '#156486',
  },
  progressDotInactive: {
    backgroundColor: '#b4c4c5',
  },
  questionText: {
    fontFamily: 'System',
    fontSize: 15,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 40,
  },
  occupationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 10,
  },
  hexagonContainer: {
    margin: 8,
    width: 107,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hexagon: {
    width: 107,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    borderWidth: 2,
  },
  hexagonSelected: {
    backgroundColor: '#156486',
    borderColor: '#156486',
  },
  hexagonDefault: {
    backgroundColor: '#f0f0f0',
    borderColor: '#156486',
  },
  hexagonText: {
    fontFamily: 'System',
    fontWeight: '600',
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 22,
  },
  hexagonTextSelected: {
    color: '#fafeff',
  },
  hexagonTextDefault: {
    color: '#101420',
  },
});

export default App;