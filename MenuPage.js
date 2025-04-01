import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ScrollView, TouchableOpacity, Image, View, Text, StyleSheet, Animated, BackHandler  } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStatistics } from './stat';
import LottieView from 'lottie-react-native';
import AppDescriptionModal from './AppDescriptionModal'; // Подключаем модальное окно
import AppInfoModal from './AppInfoModal'; // Подключаем модальное окно
import Constants from 'expo-constants';


import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
// import { devTestNotification } from './notifications'; // если функция там

// import * as Notifications from 'expo-notifications';

export const devTestNotification = async () => {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    if (newStatus !== 'granted') return;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Основной канал',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
    });
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🔔 Тестовое уведомление',
      body: 'Если ты это видишь — всё работает! 🎉',
      sound: 'default',
      channelId: 'default',
    },
    trigger: {
      seconds: 10,
      repeats: false,
    },
  });
};



const localstyle = StyleSheet.create({
  button: {
    marginVertical: 10,
    marginHorizontal: 20,
    backgroundColor: "#0038b8",
    paddingBottom: 10,
    paddingLeft: 10,
    width: '90%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingRight: 10
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 38,
    color: 'white'
  }
});

export default function MenuPage({ route }) {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [stats, setStats] = useState({});
  const [animationFinished, setAnimationFinished] = useState(false);
  const [animationTriggered, setAnimationTriggered] = useState(false);
  const [navigateTo, setNavigateTo] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false); // Состояние для модального окна
  const [totalExercisesCompleted, setTotalExercisesCompleted] = useState(0);
  const [averageCompletionRate, setAverageCompletionRate] = useState(0);
  const [isInfoModalVisible, setIsInfoModalVisible] = useState(false);
  const [activeDays, setActiveDays] = useState(0);
  const [statsAnimationFinished, setStatsAnimationFinished] = useState(false);
  const [exitConfirmationVisible, setExitConfirmationVisible] = useState(false);
    const [isStatModalVisible, setIsStatModalVisible] = useState(false);
    const [isDescriptionModalVisible, setIsDescriptionModalVisible] = useState(false);

    useEffect(() => {
          navigation.setOptions({
            headerLeft: () => null, // Убирает кнопку "Назад" в заголовке
          });
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
          navigation.reset({
            index: 0,
            routes: [{ name: 'Welcome' }],
          });
          return true; // Предотвращаем стандартное поведение "назад"
        };
      
        const backHandler = BackHandler.addEventListener(
          'hardwareBackPress',
          onBackPress
        );
    
        
      
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


    const previousTotalCompletedRef = useRef(null);
    const PREVIOUS_TOTAL_KEY = 'previousTotalExercises';

    const cleanUpActiveDays = async () => {
      try {
        const storedDates = await AsyncStorage.getItem('activeDays');
        let activeDates = storedDates ? JSON.parse(storedDates) : [];
    
        // Удаляем дубликаты
        const uniqueDates = Array.from(new Set(activeDates));
        await AsyncStorage.setItem('activeDays', JSON.stringify(uniqueDates));
        setActiveDays(uniqueDates.length);
    
        console.log("✅ Очищенные даты активности:", uniqueDates);
      } catch (error) {
        console.error("❌ Ошибка при очистке активных дней:", error);
      }
    };

    const fetchStatistics = async () => {
      const exerciseIds = ['exercise1', 'exercise2', 'exercise3', 'exercise5', 'exercise6', 'exercise8', 'exercise4', 'exercise7'];
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
    
      console.log("📊 Загруженная статистика:", statsData);
    
      setStats(statsData);
    
      const totalCompletedNow = Object.values(statsData).reduce(
        (sum, stat) => sum + (stat?.timesCompleted || 0),
        0
      );
    
      console.log("🧮 totalCompletedNow:", totalCompletedNow);
    
      try {
        const storedPrev = await AsyncStorage.getItem(PREVIOUS_TOTAL_KEY);
        const previousTotal = storedPrev ? parseInt(storedPrev, 10) : 0;
    
        console.log("📥 previousTotal (из AsyncStorage):", previousTotal);
    
        if (totalCompletedNow > previousTotal) {
          console.log("🟢 Прогресс есть! Засчитываем день.");
          await saveExerciseDate();
        } else {
          console.log("🟡 Прогресса нет. День не засчитан.");
        }
    
        await AsyncStorage.setItem(PREVIOUS_TOTAL_KEY, totalCompletedNow.toString());
        console.log("💾 Сохранили новое значение:", totalCompletedNow);
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
  
      // Загружаем сохраненные даты активности
      const storedDates = await AsyncStorage.getItem('activeDays');
      let activeDates = storedDates ? JSON.parse(storedDates) : [];
      activeDates.forEach(date => uniqueDays.add(date));
  
      // Устанавливаем обновленные значения
      setTotalExercisesCompleted(totalCompleted);
      setAverageCompletionRate(count > 0 ? (totalRate / count).toFixed(2) : 0);
      setActiveDays(uniqueDays.size);
  
      console.log("✅ Итоговая статистика:");
      console.log("📌 Всего выполнено:", totalCompleted);
      console.log("📊 Средний результат:", count > 0 ? (totalRate / count).toFixed(2) : 0);
      console.log("📅 Активных дней:", uniqueDays.size);
    } catch (error) {
      console.error("❌ Ошибка при вычислении статистики:", error);
    }
  };
  

  // 🔹 Сохраняем дату выполнения упражнения
  const saveExerciseDate = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const storedDates = await AsyncStorage.getItem('activeDays');
      let activeDates = storedDates ? JSON.parse(storedDates) : [];
  
      if (!activeDates.includes(today)) {
        activeDates.push(today);
        await AsyncStorage.setItem('activeDays', JSON.stringify(activeDates));
        console.log("✅ День добавлен:", today);
      } else {
        console.log("ℹ️ День уже есть, не добавляем.");
      }
  
      // 🔁 В любом случае пересчитываем активные дни
      const updatedDates = await AsyncStorage.getItem('activeDays');
      let parsed = updatedDates ? JSON.parse(updatedDates) : [];
      console.log("📂 Список сохранённых дней после:", parsed);
      setActiveDays(new Set(parsed).size);
    } catch (error) {
      console.error("❌ Ошибка при сохранении даты активности:", error);
    }
  };
  

  
  

  useEffect(() => {
    const loadActiveDays = async () => {
      try {
        const storedDates = await AsyncStorage.getItem('activeDays');
        let activeDates = storedDates ? JSON.parse(storedDates) : [];
  
        setActiveDays(new Set(activeDates).size);
      } catch (error) {
        console.error("Ошибка при загрузке активных дней:", error);
      }
    };
  
    loadActiveDays();
  }, []);

  const highlightedButtonStyle = {
    // backgroundColor: '#ffcc00', // Желтый цвет
    // backgroundColor: '#1c3f60', // Желтый цвет
    backgroundColor: '#367088', // Желтый цвет
    borderWidth: 4,
    borderColor: '#2D4769',
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
      if (storedName) {
        setName(storedName);
      }
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
      // Меняем порядок анимаций так, чтобы они соответствовали новому порядку кнопок
      Animated.parallel([
        Animated.timing(button1Opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(button1TranslateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(button2Opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(button2TranslateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(button3Opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(button3TranslateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(button6Opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(button6TranslateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(button5Opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(button5TranslateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(button8Opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(button8TranslateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(button4Opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(button4TranslateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(button7Opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(button7TranslateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
              Animated.timing(button9Opacity, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
              }),
              Animated.timing(button9TranslateY, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
              }),
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
        Animated.timing(headerOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(titleOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(button1Opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(button2Opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(button3Opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(button4Opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(button5Opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(button6Opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(button7Opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(button8Opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(button9Opacity, {
                  toValue: 0,
                  duration: 300,
                  useNativeDriver: true,
                }),
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
      const timer = setTimeout(() => {
        setStatsAnimationFinished(true);
      }, 3500); // ⏳ 2 секунды
  
      return () => clearTimeout(timer); // Очищаем таймер при размонтировании
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
            if (!navigateTo) {
              startAnimations();
            }
          }}
          style={styles.lottie}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Animated.View style={[styles.headerContainer, { opacity: headerOpacity }]}>
        <Image
          source={require('./VERBIFY.png')}
          style={styles.image}
        />
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
      // speed={1.2}
      // duration={2000}
      onAnimationFinish={() => setStatsAnimationFinished(true)}
      style={styles.statsAnimation}
    />
  ) : (
    <>
      <Image source={require('./STAT2.png')} style={styles.statsImage} />
      <View style={styles.statsTextContainer}>
        <View style={styles.statsRow}>
          <Text style={styles.statsText} maxFontSizeMultiplier={1.2}>ВЫПОЛНЕНО УПРАЖНЕНИЙ</Text>
          <View style={styles.statsBox}>
            <Text style={styles.statsValue} maxFontSizeMultiplier={1.2}>{totalExercisesCompleted}</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.statsText} maxFontSizeMultiplier={1.2}>СРЕДНИЙ РЕЗУЛЬТАТ</Text>
          <View style={styles.statsBox}>
            <Text style={styles.statsValue} maxFontSizeMultiplier={1.2}>{averageCompletionRate}%</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.statsText} maxFontSizeMultiplier={1.2}>ДНЕЙ ЗАНЯТИЙ</Text>
          <View style={styles.statsBox}>
            <Text style={styles.statsValue} maxFontSizeMultiplier={1.2}>{activeDays}</Text>
          </View>
        </View>
      </View>
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
              <Text style={styles.upperText1}maxFontSizeMultiplier={1.2}>УПРАЖНЕНИЕ  1</Text>
              <Image source={require('./star1.png')} style={[styles.image1]} />
            </View>
            <View style={styles.upperPart2}>
              <Text style={styles.upperText}maxFontSizeMultiplier={1.2}>КАРТОЧКИ ГЛАГОЛОВ ИВРИТ-РУССКИЙ</Text>
            </View>
            <View style={styles.lowerRight}>
              <Text style={styles.lowerText}maxFontSizeMultiplier={1.2}>СДЕЛАНО  <Text style={styles.statValue}maxFontSizeMultiplier={1.2}>{stats['exercise1'] ? stats['exercise1'].timesCompleted : 0}</Text> </Text>
              <Text style={styles.lowerText}maxFontSizeMultiplier={1.2}>СРЕДНИЙ РЕЗУЛЬТАТ  <Text style={styles.statValue}maxFontSizeMultiplier={1.2}>{stats['exercise1'] ? stats['exercise1'].averageCompletionRate.toFixed(2) : 0}%</Text></Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.buttonContainer, { opacity: button2Opacity, transform: [{ translateY: button2TranslateY }] }]}>
          <TouchableOpacity onPress={() => handlePress('Exercise2')}>
            <View style={styles.upperPart1}>
              <Text style={styles.upperText1}maxFontSizeMultiplier={1.2}>УПРАЖНЕНИЕ  2</Text>
              <Image source={require('./star2.png')} style={[styles.image1]} />
            </View>
            <View style={styles.upperPart2}>
              <Text style={styles.upperText}maxFontSizeMultiplier={1.2}>КАРТОЧКИ ГЛАГОЛОВ РУССКИЙ-ИВРИТ</Text>
            </View>
            <View style={styles.lowerRight}>
              <Text style={styles.lowerText}maxFontSizeMultiplier={1.2}>СДЕЛАНО  <Text style={styles.statValue}maxFontSizeMultiplier={1.2}>{stats['exercise2'] ? stats['exercise2'].timesCompleted : 0}</Text> </Text>
              <Text style={styles.lowerText}maxFontSizeMultiplier={1.2}>СРЕДНИЙ РЕЗУЛЬТАТ  <Text style={styles.statValue}maxFontSizeMultiplier={1.2}>{stats['exercise2'] ? stats['exercise2'].averageCompletionRate.toFixed(2) : 0}%</Text></Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.buttonContainer, { opacity: button3Opacity, transform: [{ translateY: button3TranslateY }] }]}>
          <TouchableOpacity onPress={() => handlePress('Exercise3')}>
            <View style={styles.upperPart1}>
              <Text style={styles.upperText1}maxFontSizeMultiplier={1.2}>УПРАЖНЕНИЕ  3</Text>
              <Image source={require('./star3.png')} style={[styles.image1]} />
            </View>
            <View style={styles.upperPart2}>
              <Text style={styles.upperText}maxFontSizeMultiplier={1.2}>ОПРЕДЕЛИ БИНЬЯН ГЛАГОЛА</Text>
            </View>
            <View style={styles.lowerRight}>
              <Text style={styles.lowerText}maxFontSizeMultiplier={1.2}>СДЕЛАНО  <Text style={styles.statValue}maxFontSizeMultiplier={1.2}>{stats['exercise3'] ? stats['exercise3'].timesCompleted : 0}</Text> </Text>
              <Text style={styles.lowerText}maxFontSizeMultiplier={1.2}>СРЕДНИЙ РЕЗУЛЬТАТ  <Text style={styles.statValue}maxFontSizeMultiplier={1.2}>{stats['exercise3'] ? stats['exercise3'].averageCompletionRate.toFixed(2) : 0}%</Text></Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.buttonContainer, { opacity: button6Opacity, transform: [{ translateY: button6TranslateY }] }]}>
          <TouchableOpacity onPress={() => handlePress('Exercise5')}>
            <View style={styles.upperPart1}>
              <Text style={styles.upperText1}maxFontSizeMultiplier={1.2}>УПРАЖНЕНИЕ  4</Text>
              <Image source={require('./star3.png')} style={[styles.image1]} />
            </View>
            <View style={styles.upperPart2}>
              <Text style={styles.upperText}maxFontSizeMultiplier={1.2}>ПОВЕЛИТЕЛЬНОЕ НАКЛОНЕНИЕ</Text>
            </View>
            <View style={styles.lowerRight}>
              <Text style={styles.lowerText}maxFontSizeMultiplier={1.2}>СДЕЛАНО  <Text style={styles.statValue}maxFontSizeMultiplier={1.2}>{stats['exercise5'] ? stats['exercise5'].timesCompleted : 0}</Text> </Text>
              <Text style={styles.lowerText}maxFontSizeMultiplier={1.2}>СРЕДНИЙ РЕЗУЛЬТАТ  <Text style={styles.statValue}maxFontSizeMultiplier={1.2}>{stats['exercise5'] ? stats['exercise5'].averageCompletionRate.toFixed(2) : 0}%</Text></Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.buttonContainer, highlightedButtonStyle, { opacity: button6Opacity, transform: [{ translateY: button6TranslateY }] }]}>

          <TouchableOpacity onPress={() => handlePress('Exercise6')}>
            <View style={styles.upperPart1}>
              <Text style={styles.upperText1}maxFontSizeMultiplier={1.2}>УПРАЖНЕНИЕ  5</Text>
              <Image source={require('./star4.png')} style={[styles.image1]} />
            </View>
            <View style={styles.upperPart2}>
              <Text style={styles.upperText}maxFontSizeMultiplier={1.2}>СПРЯЖЕНИЕ ГЛАГОЛА РУССКИЙ-ИВРИТ</Text>
            </View>
            <View style={styles.lowerRight}>
              <Text style={styles.lowerText}maxFontSizeMultiplier={1.2}>СДЕЛАНО  <Text style={styles.statValue}maxFontSizeMultiplier={1.2}>{stats['exercise6'] ? stats['exercise6'].timesCompleted : 0}</Text> </Text>
              <Text style={styles.lowerText}maxFontSizeMultiplier={1.2}>СРЕДНИЙ РЕЗУЛЬТАТ  <Text style={styles.statValue}maxFontSizeMultiplier={1.2}>{stats['exercise6'] ? stats['exercise6'].averageCompletionRate.toFixed(2) : 0}%</Text></Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.buttonContainer, highlightedButtonStyle, { opacity: button6Opacity, transform: [{ translateY: button6TranslateY }] }]}>
          <TouchableOpacity onPress={() => handlePress('Exercise8')}>
            <View style={styles.upperPart1}>
              <Text style={styles.upperText1}maxFontSizeMultiplier={1.2}>УПРАЖНЕНИЕ  6</Text>
              <Image source={require('./star4.png')} style={[styles.image1]} />
            </View>
            <View style={styles.upperPart2}>
              <Text style={styles.upperText}maxFontSizeMultiplier={1.2}>СПРЯЖЕНИЕ ГЛАГОЛА ИВРИТ-РУССКИЙ</Text>
            </View>
            <View style={styles.lowerRight}>
              <Text style={styles.lowerText}maxFontSizeMultiplier={1.2}>СДЕЛАНО  <Text style={styles.statValue}maxFontSizeMultiplier={1.2}>{stats['exercise8'] ? stats['exercise8'].timesCompleted : 0}</Text> </Text>
              <Text style={styles.lowerText}maxFontSizeMultiplier={1.2}>СРЕДНИЙ РЕЗУЛЬТАТ  <Text style={styles.statValue}maxFontSizeMultiplier={1.2}>{stats['exercise8'] ? stats['exercise8'].averageCompletionRate.toFixed(2) : 0}%</Text></Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.buttonContainer, { opacity: button4Opacity, transform: [{ translateY: button4TranslateY }] }]}>
          <TouchableOpacity onPress={() => handlePress('Exercise4')}>
            <View style={styles.upperPart1}>
              <Text style={styles.upperText1}maxFontSizeMultiplier={1.2}>УПРАЖНЕНИЕ  7</Text>
              <Image source={require('./star5.png')} style={[styles.image1]} />
            </View>
            <View style={styles.upperPart2}>
              <Text style={styles.upperText}maxFontSizeMultiplier={1.2}>СПРЯЖЕНИЕ ГЛАГОЛОВ РУССКИЙ-ИВРИТ</Text>
            </View>
            <View style={styles.lowerRight}>
              <Text style={styles.lowerText}maxFontSizeMultiplier={1.2}>СДЕЛАНО  <Text style={styles.statValue}maxFontSizeMultiplier={1.2}>{stats['exercise4'] ? stats['exercise4'].timesCompleted : 0}</Text> </Text>
              <Text style={styles.lowerText}maxFontSizeMultiplier={1.2}>СРЕДНИЙ РЕЗУЛЬТАТ  <Text style={styles.statValue}maxFontSizeMultiplier={1.2}>{stats['exercise4'] ? stats['exercise4'].averageCompletionRate.toFixed(2) : 0}%</Text></Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        

       

        <Animated.View style={[styles.buttonContainer, { opacity: button7Opacity, transform: [{ translateY: button7TranslateY }] }]}>
          <TouchableOpacity onPress={() => handlePress('Exercise7')}>
            <View style={styles.upperPart1}>
              <Text style={styles.upperText1}maxFontSizeMultiplier={1.2}>УПРАЖНЕНИЕ  8</Text>
              <Image source={require('./star5.png')} style={[styles.image1]} />
            </View>
            <View style={styles.upperPart2}>
              <Text style={styles.upperText}maxFontSizeMultiplier={1.2}>СПРЯЖЕНИЕ ГЛАГОЛОВ ИВРИТ-РУССКИЙ</Text>
            </View>
            <View style={styles.lowerRight}>
              <Text style={styles.lowerText}maxFontSizeMultiplier={1.2}>СДЕЛАНО  <Text style={styles.statValue}maxFontSizeMultiplier={1.2}>{stats['exercise7'] ? stats['exercise7'].timesCompleted : 0}</Text> </Text>
              <Text style={styles.lowerText}maxFontSizeMultiplier={1.2}>СРЕДНИЙ РЕЗУЛЬТАТ  <Text style={styles.statValue}maxFontSizeMultiplier={1.2}>{stats['exercise7'] ? stats['exercise7'].averageCompletionRate.toFixed(2) : 0}%</Text></Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        

        

        {/* КНОПКА ДЛЯ ОТКРЫТИЯ МОДАЛЬНОГО ОКНА */}
        <Animated.View style={[styles.buttonContainer1, { opacity: button9Opacity, transform: [{ translateY: button7TranslateY }] }]}>
         
         <Image source={require('./quest.png')} style={styles.buttonIcon} />
         <TouchableOpacity onPress={() => setIsModalVisible(true)}>
  
  <Text style={styles.titleText1} maxFontSizeMultiplier={1.2}>ОПИСАНИЕ ПРИЛОЖЕНИЯ</Text>
</TouchableOpacity>
</Animated.View>
     

      {/* МОДАЛЬНОЕ ОКНО */}
      <AppDescriptionModal visible={isModalVisible} onToggle={() => setIsModalVisible(false)} />
      <Animated.View style={[styles.buttonContainer1, { opacity: button9Opacity, transform: [{ translateY: button7TranslateY }] }]}>
     
      <Image source={require('./about.png')} style={styles.buttonIcon} />
<TouchableOpacity style={styles.button} onPress={() => setIsInfoModalVisible(true)}>
  <Text style={styles.titleText1} maxFontSizeMultiplier={1.2}>О ПРИЛОЖЕНИИ</Text>
</TouchableOpacity>

</Animated.View>

<AppInfoModal visible={isInfoModalVisible} onClose={() => setIsInfoModalVisible(false)} />

<TouchableOpacity
  onPress={devTestNotification}
  style={{ padding: 10, backgroundColor: '#4A6491', margin: 20, borderRadius: 8 }}
>
  <Text style={{ color: 'white', fontWeight: 'bold' }}>🔔 Тест уведомления</Text>
</TouchableOpacity> 

<TouchableOpacity
  onPress={cleanUpActiveDays}
  style={{ padding: 10, backgroundColor: '#bf360c', margin: 20, borderRadius: 8 }}
>
  <Text style={{ color: 'white', fontWeight: 'bold' }}>🧹 Очистить активные дни</Text>
</TouchableOpacity>


        
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({



  buttonIcon: {
    width: 30,  // Размер иконки
    height: 30, 
    // marginRight: 10, // Отступ справа перед текстом
    position: 'absolute', // Позиционируем иконку внутри кнопки
    left: 30, // Прижимаем к левому краю с отступом 20
  },

  statsContainer: {
    flexDirection: 'row',  
    alignItems: 'center',  
    justifyContent: 'space-between',  
    backgroundColor: '#bd462a',  
    padding: 8,
    borderRadius: 10,
    // marginBottom: 2,
    borderWidth: 3,
    borderColor: '#2D4769',
    height: 90,  // Фиксированная высота блока
  },
  
  statsImage: {
    width: 80,
    height: 80,
    marginRight: 12,
    marginLeft: 10
  },
  
  statsTextContainer: {
    flex: 1,
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
    width: 60,  // Одинаковая ширина ячеек
    height: 20,
    backgroundColor: 'white',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',  // Центрирование в контейнере
    textAlignVertical: 'center',
  },
  
  statsValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#367088',
    textAlign: 'center',  // Центрируем текст в ячейке
    textAlignVertical: 'center',
    lineHeight: 16,  // Выравнивание по высоте ячейки
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
    marginRight: 20, // Отступ справа от изображения
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
    // backgroundColor: '#367088',
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonContainer1: {
    flexDirection: 'row', // Размещаем элементы в строку
    
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2D4769',
    // backgroundColor: '#367088',
    paddingVertical: 3,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
    // marginLeft: 20,
    // marginRight: 20,
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
    width: '100%', // Подгоняем по ширине контейнера
    height: '150%', // Подгоняем по высоте контейнера
  },
});
