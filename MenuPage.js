import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Image,
  View,
  Text,
  StyleSheet,
  Animated,
  BackHandler,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStatistics } from './stat';
import LottieView from 'lottie-react-native';
import AppDescriptionModal from './AppDescriptionModal';
import AppInfoModal from './AppInfoModal';
import FadeInView from './api/FadeInView';


export default function MenuPage({ route }) {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [stats, setStats] = useState({});
  const [animationFinished, setAnimationFinished] = useState(false);
  const [animationTriggered, setAnimationTriggered] = useState(false);
  const [navigateTo, setNavigateTo] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [totalExercisesCompleted, setTotalExercisesCompleted] = useState(0);
  const [averageCompletionRate, setAverageCompletionRate] = useState(0);
  const [isInfoModalVisible, setIsInfoModalVisible] = useState(false);
  const [activeDays, setActiveDays] = useState(0);
  const [statsAnimationFinished, setStatsAnimationFinished] = useState(false);
  const [exitConfirmationVisible, setExitConfirmationVisible] = useState(false);
  const [isStatModalVisible, setIsStatModalVisible] = useState(false);
  const [isDescriptionModalVisible, setIsDescriptionModalVisible] = useState(false);


  

  useEffect(() => {
    navigation.setOptions({ headerLeft: () => null });
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      setExitConfirmationVisible(false);
      setIsStatModalVisible(false);
      setIsDescriptionModalVisible(false);
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      console.log('Current Stack:', navigation.getState());
    }, [navigation])
  );

  useEffect(() => {
    const onBackPress = () => {
      navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backHandler.remove();
  }, [navigation]);

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;

  const button1Opacity = useRef(new Animated.Value(0)).current;
  const button1TranslateY = useRef(new Animated.Value(250)).current;

  const button2Opacity = useRef(new Animated.Value(0)).current;
  const button2TranslateY = useRef(new Animated.Value(250)).current;

  const button3Opacity = useRef(new Animated.Value(0)).current;
  const button3TranslateY = useRef(new Animated.Value(250)).current;

  const button4Opacity = useRef(new Animated.Value(0)).current;
  const button4TranslateY = useRef(new Animated.Value(250)).current;

  const button5Opacity = useRef(new Animated.Value(0)).current;
  const button5TranslateY = useRef(new Animated.Value(250)).current;

  const button6Opacity = useRef(new Animated.Value(0)).current;
  const button6TranslateY = useRef(new Animated.Value(250)).current;

  const button7Opacity = useRef(new Animated.Value(0)).current;
  const button7TranslateY = useRef(new Animated.Value(250)).current;

  const button8Opacity = useRef(new Animated.Value(0)).current;
  const button8TranslateY = useRef(new Animated.Value(250)).current;

  const button9Opacity = useRef(new Animated.Value(0)).current;
  const button9TranslateY = useRef(new Animated.Value(250)).current;

  const PREVIOUS_TOTAL_KEY = 'previousTotalExercises';

  const fetchStatistics = async () => {
    const exerciseIds = [
      'exercise1',
      'exercise2',
      'exercise3',
      'exercise5',
      'exercise6',
      'exercise8',
      'exercise4',
      'exercise7',
    ];
    const statsData = {};

    for (let id of exerciseIds) {
      const stat = await getStatistics(id);
      statsData[id] = stat
        ? {
            timesCompleted: stat.timesCompleted ?? 0,
            averageCompletionRate: stat.averageCompletionRate ?? 0,
          }
        : { timesCompleted: 0, averageCompletionRate: 0 };
    }

    console.log('📊 Загруженная статистика:', statsData);
    setStats(statsData);

    const totalCompletedNow = Object.values(statsData).reduce(
      (sum, stat) => sum + (stat?.timesCompleted || 0),
      0
    );

    console.log('🧮 totalCompletedNow:', totalCompletedNow);

    try {
      const storedPrev = await AsyncStorage.getItem(PREVIOUS_TOTAL_KEY);
      const previousTotal = storedPrev ? parseInt(storedPrev, 10) : 0;

      console.log('📥 previousTotal (из AsyncStorage):', previousTotal);

      if (totalCompletedNow > previousTotal) {
        console.log('🟢 Прогресс есть! Засчитываем день.');
        await saveExerciseDate();
      } else {
        console.log('🟡 Прогресса нет. День не засчитан.');
      }

      await AsyncStorage.setItem(PREVIOUS_TOTAL_KEY, totalCompletedNow.toString());
      console.log('💾 Сохранили новое значение:', totalCompletedNow);
    } catch (error) {
      console.error('❌ Ошибка при работе с previousTotalExercises:', error);
    }

    await calculateTotalStats(statsData);
  };

  const calculateTotalStats = async (statsData) => {
    try {
      let totalCompleted = 0;
      let totalRate = 0;
      let count = 0;
      let uniqueDays = new Set();

      for (let key in statsData) {
        totalCompleted += statsData[key].timesCompleted;
        if (statsData[key].timesCompleted > 0) {
          totalRate += statsData[key].averageCompletionRate;
          count++;
        }
      }

      const storedDates = await AsyncStorage.getItem('activeDays');
      let activeDates = storedDates ? JSON.parse(storedDates) : [];
      activeDates.forEach((date) => uniqueDays.add(date));

      setTotalExercisesCompleted(totalCompleted);
      setAverageCompletionRate(count > 0 ? (totalRate / count).toFixed(2) : 0);
      setActiveDays(uniqueDays.size);

      console.log('✅ Итоговая статистика:');
      console.log('📌 Всего выполнено:', totalCompleted);
      console.log('📊 Средний результат:', count > 0 ? (totalRate / count).toFixed(2) : 0);
      console.log('📅 Активных дней:', uniqueDays.size);
    } catch (error) {
      console.error('❌ Ошибка при вычислении статистики:', error);
    }
  };

  const saveExerciseDate = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const storedDates = await AsyncStorage.getItem('activeDays');
      let activeDates = storedDates ? JSON.parse(storedDates) : [];

      if (!activeDates.includes(today)) {
        activeDates.push(today);
        await AsyncStorage.setItem('activeDays', JSON.stringify(activeDates));
        console.log('✅ День добавлен:', today);
      } else {
        console.log('ℹ️ День уже есть, не добавляем.');
      }

      const updatedDates = await AsyncStorage.getItem('activeDays');
      let parsed = updatedDates ? JSON.parse(updatedDates) : [];
      console.log('📂 Список сохранённых дней после:', parsed);
      setActiveDays(new Set(parsed).size);
    } catch (error) {
      console.error('❌ Ошибка при сохранении даты активности:', error);
    }
  };

  useEffect(() => {
    const loadActiveDays = async () => {
      try {
        const storedDates = await AsyncStorage.getItem('activeDays');
        let activeDates = storedDates ? JSON.parse(storedDates) : [];
        setActiveDays(new Set(activeDates).size);
      } catch (error) {
        console.error('Ошибка при загрузке активных дней:', error);
      }
    };
    loadActiveDays();
  }, []);

  const highlightedButtonStyle = {
    backgroundColor: '#367088',
    borderWidth: 4,
    borderColor: '#2D4769',
  };

  const hardlightedButtonStyle = {
    backgroundColor: '#2D4769',
    borderWidth: 4,
    borderColor: '#42849f',
  };

  useFocusEffect(
    useCallback(() => {
      fetchStatistics();
      setAnimationFinished(false);
      setAnimationTriggered(false);
      setNavigateTo(null);
    }, [])
  );

  useEffect(() => {
    const getName = async () => {
      const storedName = await AsyncStorage.getItem('name');
      if (storedName) setName(storedName);
    };
    getName();
  }, []);

  const startAnimations = () => {
    Animated.timing(headerOpacity, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    Animated.timing(titleOpacity, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    Animated.stagger(300, [
      Animated.parallel([
        Animated.timing(button1Opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(button1TranslateY, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(button2Opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(button2TranslateY, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(button3Opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(button3TranslateY, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(button6Opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(button6TranslateY, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(button5Opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(button5TranslateY, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(button8Opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(button8TranslateY, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(button4Opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(button4TranslateY, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(button7Opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(button7TranslateY, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(button9Opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(button9TranslateY, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
    ]).start();
  };

  const handlePress = (exercise) => {
    setNavigateTo(exercise);
    setAnimationTriggered(true);
  };

  useEffect(() => {
    if (animationTriggered) {
      Animated.stagger(100, [
        Animated.timing(headerOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(titleOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(button1Opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(button2Opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(button3Opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(button4Opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(button5Opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(button6Opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(button7Opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(button8Opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(button9Opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => {
        setTimeout(() => {
          if (navigateTo) {
            navigation.navigate(navigateTo);
            setAnimationTriggered(false);
          }
        }, 100);
      });
    }
  }, [animationTriggered, navigateTo, navigation]);

  useEffect(() => {
    if (!statsAnimationFinished) {
      const timer = setTimeout(() => setStatsAnimationFinished(true), 3500);
      return () => clearTimeout(timer);
    }
  }, [statsAnimationFinished]);

  if (!animationFinished || animationTriggered) {
    return (
      <View style={styles.animationContainer}>
        <LottieView
          source={require('./assets/Animation - 1718360283264.json')}
          autoPlay
          loop={false}
          onAnimationFinish={() => {
            setAnimationFinished(true);
            if (!navigateTo) startAnimations();
          }}
          style={styles.lottie}
        />
      </View>
    );
  }

  return (


    
    <ScrollView style={styles.container}>
      <Animated.View style={[styles.headerContainer, { opacity: headerOpacity }]}>
        <Image source={require('./VERBIFY.png')} style={styles.image} />
        <Text style={styles.greeting} maxFontSizeMultiplier={1.2}>
          Привет, {name}!
        </Text>
      </Animated.View>

      {/* 🔹 Блок общей статистики */}
      <Animated.View style={[styles.statsContainer, { opacity: titleOpacity }]}>
        {!statsAnimationFinished ? (
          <LottieView
            source={require('./Animation - 1741202326129.json')}
            autoPlay
            loop={false}
            onAnimationFinish={() => setStatsAnimationFinished(true)}
            style={styles.statsAnimation}
          />
        ) : (
          <>
            <Image source={require('./STAT2.png')} style={styles.statsImage} />
            <FadeInView style={styles.statsTextContainer}>
              <View style={styles.statsRow}>
                <Text style={styles.statsText} maxFontSizeMultiplier={1.2}>
                  ВЫПОЛНЕНО УПРАЖНЕНИЙ
                </Text>
                <View style={styles.statsBox}>
                  <Text style={styles.statsValue} maxFontSizeMultiplier={1.2}>
                    {totalExercisesCompleted}
                  </Text>
                </View>
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.statsText} maxFontSizeMultiplier={1.2}>
                  СРЕДНИЙ РЕЗУЛЬТАТ
                </Text>
                <View style={styles.statsBox}>
                  <Text style={styles.statsValue} maxFontSizeMultiplier={1.2}>
                    {averageCompletionRate}%
                  </Text>
                </View>
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.statsText} maxFontSizeMultiplier={1.2}>
                  ДНЕЙ ЗАНЯТИЙ
                </Text>
                <View style={styles.statsBox}>
                  <Text style={styles.statsValue} maxFontSizeMultiplier={1.2}>
                    {activeDays}
                  </Text>
                </View>
              </View>
            </FadeInView>
          </>
        )}
      </Animated.View>

      <View style={styles.content}>
        <Animated.Text style={[styles.titleText, { opacity: titleOpacity }]} maxFontSizeMultiplier={1.2}>
          ВЫБЕРИ УПРАЖНЕНИЕ
        </Animated.Text>

        <Animated.View style={[styles.buttonContainer, { opacity: button1Opacity, transform: [{ translateY: button1TranslateY }] }]}>
          <TouchableOpacity onPress={() => handlePress('Exercise1')}>
            <View style={styles.upperPart1}>
              <Text style={styles.upperText1} maxFontSizeMultiplier={1.2}>УПРАЖНЕНИЕ  1</Text>
              <Image source={require('./star1.png')} style={[styles.image1]} />
            </View>
            <View style={styles.upperPart2}>
              <Text style={styles.upperText} maxFontSizeMultiplier={1.2}>КАРТОЧКИ ГЛАГОЛОВ ИВРИТ-РУССКИЙ</Text>
            </View>
            <View style={styles.lowerRight}>
              <Text style={styles.lowerText} maxFontSizeMultiplier={1.2}>
                СДЕЛАНО  <Text style={styles.statValue} maxFontSizeMultiplier={1.2}>{stats['exercise1'] ? stats['exercise1'].timesCompleted : 0}</Text>{' '}
              </Text>
              <Text style={styles.lowerText} maxFontSizeMultiplier={1.2}>
                СРЕДНИЙ РЕЗУЛЬТАТ  <Text style={styles.statValue} maxFontSizeMultiplier={1.2}>{stats['exercise1'] ? stats['exercise1'].averageCompletionRate.toFixed(2) : 0}%</Text>
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.buttonContainer, { opacity: button2Opacity, transform: [{ translateY: button2TranslateY }] }]}>
          <TouchableOpacity onPress={() => handlePress('Exercise2')}>
            <View style={styles.upperPart1}>
              <Text style={styles.upperText1} maxFontSizeMultiplier={1.2}>УПРАЖНЕНИЕ  2</Text>
              <Image source={require('./star2.png')} style={[styles.image1]} />
            </View>
            <View style={styles.upperPart2}>
              <Text style={styles.upperText} maxFontSizeMultiplier={1.2}>КАРТОЧКИ ГЛАГОЛОВ РУССКИЙ-ИВРИТ</Text>
            </View>
            <View style={styles.lowerRight}>
              <Text style={styles.lowerText} maxFontSizeMultiplier={1.2}>
                СДЕЛАНО  <Text style={styles.statValue} maxFontSizeMultiplier={1.2}>{stats['exercise2'] ? stats['exercise2'].timesCompleted : 0}</Text>{' '}
              </Text>
              <Text style={styles.lowerText} maxFontSizeMultiplier={1.2}>
                СРЕДНИЙ РЕЗУЛЬТАТ  <Text style={styles.statValue} maxFontSizeMultiplier={1.2}>{stats['exercise2'] ? stats['exercise2'].averageCompletionRate.toFixed(2) : 0}%</Text>
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.buttonContainer, { opacity: button3Opacity, transform: [{ translateY: button3TranslateY }] }]}>
          <TouchableOpacity onPress={() => handlePress('Exercise3')}>
            <View style={styles.upperPart1}>
              <Text style={styles.upperText1} maxFontSizeMultiplier={1.2}>УПРАЖНЕНИЕ  3</Text>
              <Image source={require('./star3.png')} style={[styles.image1]} />
            </View>
            <View style={styles.upperPart2}>
              <Text style={styles.upperText} maxFontSizeMultiplier={1.2}>ОПРЕДЕЛИ БИНЬЯН ГЛАГОЛА</Text>
            </View>
            <View style={styles.lowerRight}>
              <Text style={styles.lowerText} maxFontSizeMultiplier={1.2}>
                СДЕЛАНО  <Text style={styles.statValue} maxFontSizeMultiplier={1.2}>{stats['exercise3'] ? stats['exercise3'].timesCompleted : 0}</Text>{' '}
              </Text>
              <Text style={styles.lowerText} maxFontSizeMultiplier={1.2}>
                СРЕДНИЙ РЕЗУЛЬТАТ  <Text style={styles.statValue} maxFontSizeMultiplier={1.2}>{stats['exercise3'] ? stats['exercise3'].averageCompletionRate.toFixed(2) : 0}%</Text>
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.buttonContainer, { opacity: button6Opacity, transform: [{ translateY: button6TranslateY }] }]}>
          <TouchableOpacity onPress={() => handlePress('Exercise5')}>
            <View style={styles.upperPart1}>
              <Text style={styles.upperText1} maxFontSizeMultiplier={1.2}>УПРАЖНЕНИЕ  4</Text>
              <Image source={require('./star3.png')} style={[styles.image1]} />
            </View>
            <View style={styles.upperPart2}>
              <Text style={styles.upperText} maxFontSizeMultiplier={1.2}>ПОВЕЛИТЕЛЬНОЕ НАКЛОНЕНИЕ</Text>
            </View>
            <View style={styles.lowerRight}>
              <Text style={styles.lowerText} maxFontSizeMultiplier={1.2}>
                СДЕЛАНО  <Text style={styles.statValue} maxFontSizeMultiplier={1.2}>{stats['exercise5'] ? stats['exercise5'].timesCompleted : 0}</Text>{' '}
              </Text>
              <Text style={styles.lowerText} maxFontSizeMultiplier={1.2}>
                СРЕДНИЙ РЕЗУЛЬТАТ  <Text style={styles.statValue} maxFontSizeMultiplier={1.2}>{stats['exercise5'] ? stats['exercise5'].averageCompletionRate.toFixed(2) : 0}%</Text>
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.buttonContainer, highlightedButtonStyle, { opacity: button6Opacity, transform: [{ translateY: button6TranslateY }] }]}>
          <TouchableOpacity onPress={() => handlePress('Exercise6')}>
            <View style={styles.upperPart1}>
              <Text style={styles.upperText1} maxFontSizeMultiplier={1.2}>УПРАЖНЕНИЕ  5</Text>
              <Image source={require('./star4.png')} style={[styles.image1]} />
            </View>
            <View style={styles.upperPart2}>
              <Text style={styles.upperText} maxFontSizeMultiplier={1.2}>СПРЯЖЕНИЕ ГЛАГОЛА РУССКИЙ-ИВРИТ</Text>
            </View>
            <View style={styles.lowerRight}>
              <Text style={styles.lowerText} maxFontSizeMultiplier={1.2}>
                СДЕЛАНО  <Text style={styles.statValue} maxFontSizeMultiplier={1.2}>{stats['exercise6'] ? stats['exercise6'].timesCompleted : 0}</Text>{' '}
              </Text>
              <Text style={styles.lowerText} maxFontSizeMultiplier={1.2}>
                СРЕДНИЙ РЕЗУЛЬТАТ  <Text style={styles.statValue} maxFontSizeMultiplier={1.2}>{stats['exercise6'] ? stats['exercise6'].averageCompletionRate.toFixed(2) : 0}%</Text>
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.buttonContainer, highlightedButtonStyle, { opacity: button6Opacity, transform: [{ translateY: button6TranslateY }] }]}>
          <TouchableOpacity onPress={() => handlePress('Exercise8')}>
            <View style={styles.upperPart1}>
              <Text style={styles.upperText1} maxFontSizeMultiplier={1.2}>УПРАЖНЕНИЕ  6</Text>
              <Image source={require('./star4.png')} style={[styles.image1]} />
            </View>
            <View style={styles.upperPart2}>
              <Text style={styles.upperText} maxFontSizeMultiplier={1.2}>СПРЯЖЕНИЕ ГЛАГОЛА ИВРИТ-РУССКИЙ</Text>
            </View>
            <View style={styles.lowerRight}>
              <Text style={styles.lowerText} maxFontSizeMultiplier={1.2}>
                СДЕЛАНО  <Text style={styles.statValue} maxFontSizeMultiplier={1.2}>{stats['exercise8'] ? stats['exercise8'].timesCompleted : 0}</Text>{' '}
              </Text>
              <Text style={styles.lowerText} maxFontSizeMultiplier={1.2}>
                СРЕДНИЙ РЕЗУЛЬТАТ  <Text style={styles.statValue} maxFontSizeMultiplier={1.2}>{stats['exercise8'] ? stats['exercise8'].averageCompletionRate.toFixed(2) : 0}%</Text>
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.buttonContainer, hardlightedButtonStyle, { opacity: button4Opacity, transform: [{ translateY: button4TranslateY }] }]}>
          <TouchableOpacity onPress={() => handlePress('Exercise4')}>
            <View style={styles.upperPart1}>
              <Text style={styles.upperText1} maxFontSizeMultiplier={1.2}>УПРАЖНЕНИЕ  7</Text>
              <Image source={require('./star5.png')} style={[styles.image1]} />
            </View>
            <View style={styles.upperPart2}>
              <Text style={styles.upperText} maxFontSizeMultiplier={1.2}>СПРЯЖЕНИЕ ГЛАГОЛОВ РУССКИЙ-ИВРИТ</Text>
            </View>
            <View style={styles.lowerRight}>
              <Text style={styles.lowerText} maxFontSizeMultiplier={1.2}>
                СДЕЛАНО  <Text style={styles.statValue} maxFontSizeMultiplier={1.2}>{stats['exercise4'] ? stats['exercise4'].timesCompleted : 0}</Text>{' '}
              </Text>
              <Text style={styles.lowerText} maxFontSizeMultiplier={1.2}>
                СРЕДНИЙ РЕЗУЛЬТАТ  <Text style={styles.statValue} maxFontSizeMultiplier={1.2}>{stats['exercise4'] ? stats['exercise4'].averageCompletionRate.toFixed(2) : 0}%</Text>
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.buttonContainer, hardlightedButtonStyle, { opacity: button7Opacity, transform: [{ translateY: button7TranslateY }] }]}>
          <TouchableOpacity onPress={() => handlePress('Exercise7')}>
            <View style={styles.upperPart1}>
              <Text style={styles.upperText1} maxFontSizeMultiplier={1.2}>УПРАЖНЕНИЕ  8</Text>
              <Image source={require('./star5.png')} style={[styles.image1]} />
            </View>
            <View style={styles.upperPart2}>
              <Text style={styles.upperText} maxFontSizeMultiplier={1.2}>СПРЯЖЕНИЕ ГЛАГОЛОВ ИВРИТ-РУССКИЙ</Text>
            </View>
            <View style={styles.lowerRight}>
              <Text style={styles.lowerText} maxFontSizeMultiplier={1.2}>
                СДЕЛАНО  <Text style={styles.statValue} maxFontSizeMultiplier={1.2}>{stats['exercise7'] ? stats['exercise7'].timesCompleted : 0}</Text>{' '}
              </Text>
              <Text style={styles.lowerText} maxFontSizeMultiplier={1.2}>
                СРЕДНИЙ РЕЗУЛЬТАТ  <Text style={styles.statValue} maxFontSizeMultiplier={1.2}>{stats['exercise7'] ? stats['exercise7'].averageCompletionRate.toFixed(2) : 0}%</Text>
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Кнопки «о приложении» */}
        <Animated.View style={[styles.buttonContainer1, { opacity: button9Opacity, transform: [{ translateY: button7TranslateY }] }]}>
          <Image source={require('./quest.png')} style={styles.buttonIcon} />
          <TouchableOpacity onPress={() => setIsModalVisible(true)}>
            <Text style={styles.titleText1} maxFontSizeMultiplier={1.2}>
              ОПИСАНИЕ ПРИЛОЖЕНИЯ
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <AppDescriptionModal visible={isModalVisible} onToggle={() => setIsModalVisible(false)} />

        <Animated.View style={[styles.buttonContainer1, { opacity: button9Opacity, transform: [{ translateY: button7TranslateY }] }]}>
          <Image source={require('./about4.png')} style={styles.buttonIcon} />
          <TouchableOpacity style={styles.button} onPress={() => setIsInfoModalVisible(true)}>
            <Text style={styles.titleText1} maxFontSizeMultiplier={1.2}>
              О ПРИЛОЖЕНИИ
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <AppInfoModal visible={isInfoModalVisible} onToggle={() => setIsInfoModalVisible(false)} />
      </View>

    </ScrollView>





  );
}

const styles = StyleSheet.create({
  buttonIcon: {
    width: 30,
    height: 30,
    position: 'absolute',
    left: 30,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#bd462a',
    padding: 8,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#2D4769',
    height: 90,
  },
  statsImage: {
    width: 80,
    height: 80,
    marginRight: 12,
    marginLeft: 10,
  },
  statsTextContainer: {
    flex: 1,
    marginTop: 5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  statsText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'right',
    marginRight: 8,
    flex: 1,
  },
  statsBox: {
    width: 60,
    height: 20,
    backgroundColor: 'white',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    textAlignVertical: 'center',
  },
  statsValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#367088',
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 17,
  },
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 0,
    backgroundColor: '#f0f0f0',
  },
  title: {
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: -5,
  },
  image: {
    width: 90,
    height: 90,
    marginRight: 20,
    marginLeft: 5,
  },
  greeting: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D4769',
    marginLeft: 10,
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#2D4769',
    marginTop: 10,
  },
  titleText1: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: 'white',
    marginTop: 10,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2D4769',
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonContainer1: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2D4769',
    paddingVertical: 3,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
    position: 'relative',
    borderWidth: 3,
    borderColor: '#bd462a',
  },
  upperPart1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '96%',
  },
  upperPart2: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  upperText1: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2D4769',
    backgroundColor: 'white',
    padding: 3,
    borderRadius: 5,
    marginBottom: 10,
    marginLeft: 10,
  },
  upperText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  lowerRight: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  lowerText: {
    fontSize: 10,
    textAlign: 'center',
    backgroundColor: 'white',
    padding: 3,
    borderRadius: 5,
    color: '#2D4769',
    fontWeight: 'bold',
    marginLeft: 1,
  },
  image1: {
    width: 100,
    height: 25,
    marginLeft: 10,
    marginRight: 10,
    marginTop: -5,
  },
  statValue: {
    color: 'red',
    fontWeight: 'bold',
    textAlignVertical: 'center',
    fontSize: 12,
  },
  animationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  lottie: {
    width: 300,
    height: 300,
  },
  statsAnimation: {
    width: '100%',
    height: '150%',
  },
});
