import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, BackHandler } from 'react-native';
import verbsData from './verbs6RU.json';
import ProgressBar from './ProgressBar';
import { Animated } from 'react-native';
import { Audio } from 'expo-av';
import soundsconj from './soundconj';
import sounds from './Soundss';
import CompletionMessageEn from './CompletionMessageEn';
import ExitConfirmationModal from './ExitConfirmationModalEn';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import TaskDescriptionModal6 from './TaskDescriptionModal8';
import StatModal8En from './StatModal8En';
import { updateStatistics, getStatistics } from './stat';
import TypewriterTextRTL from './TypewriterTextRTL';
import TypewriterTextLTR from './TypewriterTextLTR';
import LottieView from 'lottie-react-native';
import SearchModalEn from './SearchModalEn';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import VerbListModal2 from './VerbListModal2';
import shuffleArray from './utils/shuffleArray';

const Exercise8En = () => {
  const [verbs, setVerbs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayPairs, setDisplayPairs] = useState([]);
  const [correctAnswers, setCorrectAnswers] = useState(new Set());
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [exitConfirmationVisible, setExitConfirmationVisible] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  // const [isDescriptionModalVisible, setIsDescriptionModalVisible] = useState(false);
  const [statistics, setStatistics] = useState(null);
  const [isStatModalVisible, setIsStatModalVisible] = useState(false);
  const [failureSound, setFailureSound] = useState(null);
  const [sound, setSound] = useState(null);
  const [correctSound, setCorrectSound] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [completionMessageVisible, setCompletionMessageVisible] = useState(false);
  const [blockAnimation] = useState(new Animated.Value(-100));
  const [backgroundColorAnim] = useState(new Animated.Value(0));
  const [isCorrectAnswerSelected, setIsCorrectAnswerSelected] = useState(false);
  const [inactiveButtons, setInactiveButtons] = useState(new Set());
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [nextButtonEnabled, setNextButtonEnabled] = useState(false);
  const [completionMessageOpacity] = useState(new Animated.Value(0));
  const [showInfinitive, setShowInfinitive] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [exerciseCompleted, setExerciseCompleted] = useState(false);
  const [isAnimationVisible, setIsAnimationVisible] = useState(false);
  const [currentAudioFile, setCurrentAudioFile] = useState(null); // Новый стейт для хранения текущего аудиофайла
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const navigation = useNavigation();
  const [progress, setProgress] = useState(0);
  const [totalConjugations, setTotalConjugations] = useState(36);
  const AnimatedText = Animated.createAnimatedComponent(Text);

  const navigateToMenu = () => {
    console.log('Navigating to MenuEn, current state:', navigation.getState());
    navigation.reset({
      index: 0,
      routes: [{ name: 'MenuEn' }],
    });
  };

  const showCompletionMessageWithAnimation = () => {
    setCompletionMessageVisible(true);
    Animated.timing(completionMessageOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const getGrade = (percentage) => {
    if (percentage === 100) {
      return 'Exceptional! Flawless! You didn’t make a single mistake!';
    } else if (percentage >= 90) {
      return 'Excellent! Almost perfect, keep up the great work!';
    } else if (percentage >= 80) {
      return 'Great! You are doing very well!';
    } else if (percentage >= 70) {
      return 'Good! You’ve learned the material pretty well!';
    } else if (percentage >= 60) {
      return 'Fairly good! There is steady progress!';
    } else if (percentage >= 50) {
      return 'Not bad! But there’s room for improvement.';
    } else if (percentage >= 40) {
      return 'Satisfactory! Keep working and you’ll succeed!';
    } else if (percentage >= 30) {
      return 'You’re starting to get the hang of it, keep it up!';
    } else if (percentage >= 20) {
      return 'Try changing your learning strategy, it might help!';
    } else if (percentage >= 10) {
      return 'It’s tough, but don’t give up! Keep practicing.';
    } else {
      return 'Serious work is needed! It’s important not to give up and keep learning.';
    }
  };

  const shuffleArray = (array) => {
    let newArray = array.slice();
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

useEffect(() => {
  if (verbsData && verbsData.length > 0) {
    const uniqueVerbs = [...new Set(verbsData.map(item => item.infinitive))];
    const selectedInfinitive = uniqueVerbs[Math.floor(Math.random() * uniqueVerbs.length)];
    const allForms = verbsData.filter(verb => verb.infinitive === selectedInfinitive);

    setMainVerb(allForms[0]);
    setVerbListForModal(allForms);
    setIsVerbListVisible(true); // ОТКРЫВАЕМ только на старте
    setPendingVerb(null);
  }
}, []); // Только при монтировании, без зависимостей!




  const [language, setLanguage] = useState('en'); // по умолчанию

  // 1. Функция выбора инфинитива
const getRandomInfinitive = () => {
  const uniqueVerbs = [...new Set(verbsData.map(item => item.infinitive))];
  return uniqueVerbs[Math.floor(Math.random() * uniqueVerbs.length)];
};

const [startInfinitive, setStartInfinitive] = useState(null);

useEffect(() => {
  if (verbsData && verbsData.length > 0) {
    const inf = getRandomInfinitive();
    setStartInfinitive(inf);
  }
}, [verbsData]);

useEffect(() => {
  if (!startInfinitive) return;
  const allForms = verbsData.filter(verb => verb.infinitive === startInfinitive);

  setMainVerb(allForms[0]);
  setVerbListForModal(allForms);
  setIsVerbListVisible(true);

  initializeExercise(allForms[0]);
  setPendingVerb(null);
}, [startInfinitive]);

  const [mainVerb, setMainVerb] = useState(null);
  
  const [verbListForModal, setVerbListForModal] = useState([]);
  const [isVerbListVisible, setIsVerbListVisible] = useState(true); // модалка в начале
  
  const initializeVerbList = (lang, mainVerb, setVerbListForModal) => {
    const langMap = {
      ru: 'russian',
      en: 'english',
      fr: 'french',
      es: 'spanish',
      pt: 'portu',
      ar: 'arabic',
      am: 'amharic',
    };
    const langKey = langMap[lang] || 'english';
  
    if (!mainVerb) {
      console.warn('⚠️ mainVerb is undefined');
      return;
    }
  
    console.log('🎯 Используем mainVerb:', mainVerb.infinitive, mainVerb[langKey]);
  
    const allForms = verbsData.filter((v) => {
    const sameInf = v.infinitive === mainVerb.infinitive;
    const sameTranslation = v[langKey]?.toLowerCase().trim() === mainVerb[langKey]?.toLowerCase().trim();
    return sameInf && (sameTranslation || !mainVerb[langKey]);
  });
  
  
    console.log('📦 Найдено форм:', allForms.length);
    setVerbListForModal(allForms);
  };
  
  
  
  const [showDescriptionOnce, setShowDescriptionOnce] = useState(true);
  
  useEffect(() => {
    const initialize = async () => {
      const lang = await AsyncStorage.getItem('language');
      const hidden = await AsyncStorage.getItem('exercise8_description_hidden');
      setLanguage(lang || 'en');
      setDontShowAgain8(hidden === 'true');
      setLanguageLoaded(true);
  
      // Показываем модалку только если showDescriptionOnce и нет скрывающего флага
      if (hidden !== 'true' && showDescriptionOnce) {
        setTimeout(() => {
          setDescriptionModalVisible(true);
          setShowDescriptionOnce(false); // После показа сбрасываем флаг
        }, 300);
      }
    };
    initialize();
  }, []); // Только при самом первом монтировании


  
  const [isDescriptionModalVisible, setDescriptionModalVisible] = useState(false);
  
    const [dontShowAgain8, setDontShowAgain8] = useState(false);
  
    
  
    const [languageLoaded, setLanguageLoaded] = useState(false);
  
    useEffect(() => {
    const checkFlagAndLang = async () => {
      const hidden = await AsyncStorage.getItem('exercise8_description_hidden');
      const lang = await AsyncStorage.getItem('language');
  
      console.log('🌍 Language:', lang);
      console.log('🧪 Hide flag:', hidden);
  
      if (lang) {
        setLanguage(lang);
  
        setDontShowAgain8(hidden === 'true');
      setLanguageLoaded(true);
  
        if (hidden !== 'true') {
          setTimeout(() => {
            console.log('📢 Показываем модалку после загрузки языка');
            setDescriptionModalVisible(true);
          }, 100); // чуть больше времени
        }
      }
  
      setDontShowAgain8(hidden === 'true');
    };
  
    checkFlagAndLang();
  }, []);
  
  
  
  
  const handleToggleDontShowAgain8 = async () => {
    const newValue = !dontShowAgain8;
    setDontShowAgain8(newValue);
    await AsyncStorage.setItem('exercise8_description_hidden', newValue ? 'true' : '');
    console.log('📌 Клик по чекбоксу. Было:', dontShowAgain8, 'Станет:', !dontShowAgain8);
  };

  const initializeExercise = (selectedVerb) => {
    let selectedVerbs;
    if (selectedVerb) {
      selectedVerbs = shuffleArray(verbsData.filter(verb => verb.infinitive === selectedVerb.infinitive));
    } else {
      if (verbsData && verbsData.length > 0) {
        const groupedByInfinitive = verbsData.reduce((acc, verb) => {
          const { infinitive } = verb;
          if (!acc[infinitive]) {
            acc[infinitive] = [];
          }
          acc[infinitive].push(verb);
          return acc;
        }, {});
  
        const infinitives = Object.keys(groupedByInfinitive);
        const randomInfinitive = infinitives[Math.floor(Math.random() * infinitives.length)];
        selectedVerbs = shuffleArray(groupedByInfinitive[randomInfinitive]);
      }
    }
  
    setTotalConjugations(selectedVerbs[0].infinitive === 'להיות' ? 24 : 36);
    setVerbs(selectedVerbs);
    setProgress(0);
    setCorrectCount(0);
    setIncorrectCount(0);
    setCorrectAnswers(new Set());
    setInactiveButtons(new Set());
    setSelectedAnswer(null);
    setIsCorrectAnswerSelected(false);
    setNextButtonEnabled(false);
    setCompletionMessageVisible(false);
    setExerciseCompleted(false);
    setCurrentIndex(0);
    setShowInfinitive(false);
    setShowTranslation(false);
    setCurrentAudioFile(null);
  };

  // useEffect(() => {
  //   initializeExercise();
  // }, []);

useEffect(() => {
  if (verbs.length > 0) {
    const currentVerb = verbs[currentIndex];
    const sameInfinitiveVerbs = verbs.filter(verb => verb.infinitive === currentVerb.infinitive);
    const incorrectAnswers = shuffleArray(
      sameInfinitiveVerbs.filter((verb) => verb.entext !== currentVerb.entext)
    ).slice(0, 5);

    const answers = shuffleArray([{ entext: currentVerb.entext, gender: currentVerb.gender }, ...incorrectAnswers]);

    setDisplayPairs(
      answers.map((answer) => ({
        ...answer,
        hebrewtext: currentVerb.hebrewtext,
        translit: currentVerb.translit
      }))
    );

    setShowInfinitive(false);
    setCurrentAudioFile(currentVerb.mp3);

    // ЗВУК — только если модалка скрыта
    if (!isVerbListVisible) {
      playAudio(currentVerb.mp3);
    }
  }
}, [currentIndex, verbs, isVerbListVisible]);



  useEffect(() => {
    setShowTranslation(false);
  }, [currentIndex]);

  const handleAnswer = (index) => {
    if (exerciseCompleted) return;

    const selectedAnswer = displayPairs[index];
    if (selectedAnswer.entext === verbs[currentIndex].entext) {
      handleCorrectAnswer(index, verbs[currentIndex].mp3);
    } else {
      handleIncorrectAnswer(index);
    }
  };

  const handleCorrectAnswer = (index, audioFile) => {
    setCorrectCount((prev) => {
      const newCount = prev + 1;
      if (newCount >= totalConjugations) {
        handleExerciseCompletion();
        setExerciseCompleted(true);
        setCompletionMessageVisible(true);
        Animated.timing(completionMessageOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }
      setProgress((newCount / totalConjugations) * 100);
      return newCount;
    });

    setCorrectAnswers((prev) => new Set(prev).add(selectedAnswer));
    setIsCorrectAnswerSelected(true);
    setSelectedAnswer(index);
    playCorrectAnswerSound(audioFile).then(() => {
      if (soundEnabled) {
        setIsAnimationVisible(true);
      }
    });
    changeBackgroundColor(true);

    const pauseDuration = soundEnabled ? 1000 : 200;
    setTimeout(() => {
      setNextButtonEnabled(true);
    }, pauseDuration);
  };

  const handleIncorrectAnswer = (index) => {
    if (exerciseCompleted) return;

    setIncorrectCount((prev) => prev + 1);
    setSelectedAnswer(index);
    setInactiveButtons((prev) => new Set(prev).add(index));
    playFailureSound();
    changeBackgroundColor(false);
  };

  const changeBackgroundColor = (isCorrect) => {
    backgroundColorAnim.setValue(isCorrect ? 1 : 2);
    Animated.timing(backgroundColorAnim, {
      toValue: isCorrect ? 1 : 2,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(backgroundColorAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: false,
        }).start();
      }, 100);
    });
  };

  const backgroundColor = backgroundColorAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: ['#83A3CD', '#AFFFCA', '#FFBCBC'],
  });

  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    if (verbs[currentIndex]) {
      fadeIn();
    }
  }, [verbs[currentIndex]]);

  useEffect(() => {
    if (!completionMessageVisible && displayPairs.length > 0) {
      blockAnimation.setValue(500);
      Animated.timing(blockAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [displayPairs, completionMessageVisible]);

  useEffect(() => {
    loadFailureSound();
    return () => {
      failureSound?.unloadAsync();
    };
  }, []);

  useEffect(() => {
    return () => {
      correctSound?.unloadAsync();
    };
  }, [correctSound]);

  const playCorrectAnswerSound = async (audioKey) => {
    if (!soundEnabled) return;

    try {
      if (correctSound) {
        await correctSound.unloadAsync();
      }

      const audioFile = soundsconj[audioKey];
      if (!audioFile) {
        console.error(`Audio file for key ${audioKey} not found.`);
        return;
      }

      const { sound: newSound } = await Audio.Sound.createAsync(audioFile);
      setCorrectSound(newSound);

      await newSound.playAsync();
    } catch (error) {
      console.error('Error loading sound:', error);
    }
  };

  const loadFailureSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(require('./assets/sounds/failure.mp3'));
      setFailureSound(sound);
    } catch (error) {
      console.error("Couldn't load failure sound:", error);
    }
  };

  const playAudio = async (audioFileName) => {
    if (!soundEnabled) return;
    const audioFile = soundsconj[audioFileName];
    if (!audioFile) {
      console.error(`Audio file ${audioFileName} not found.`);
      return;
    }
    try {
      if (sound && typeof sound.unloadAsync === 'function') {
        await sound.unloadAsync();
      }
      const { sound: newSound } = await Audio.Sound.createAsync(audioFile);
      setSound(newSound);
      setIsAnimationVisible(true);

      await newSound.playAsync();
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isPlaying) {
          setIsAnimationVisible(false);
        }
      });
    } catch (error) {
      console.error('Error loading sound:', error);
    }
  };

  const playAudioAlways = async (audioFileName) => {
    const audioFile = soundsconj[audioFileName];
    if (!audioFile) {
      console.error(`Audio file ${audioFileName} not found.`);
      return;
    }
    try {
      if (sound && typeof sound.unloadAsync === 'function') {
        await sound.unloadAsync();
      }
      const { sound: newSound } = await Audio.Sound.createAsync(audioFile);
      setSound(newSound);
      setIsAnimationVisible(true);

      await newSound.playAsync();
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isPlaying) {
          setIsAnimationVisible(false);
        }
      });
    } catch (error) {
      console.error('Error loading sound:', error);
    }
  };

  const playFailureSound = async () => {
    if (!soundEnabled) return;
    try {
      await failureSound.replayAsync();
    } catch (error) {
      console.error('Error playing the failure sound', error);
    }
  };

  const playInfinitiveAudio = async (audioFileName) => {
    try {
      const fileNameKey = audioFileName.replace('.mp3', '');
      const audioFile = sounds[fileNameKey];

      if (!audioFile) {
        console.error(`Audio file ${audioFileName} not found.`);
        return;
      }

      if (sound && typeof sound.unloadAsync === 'function') {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(audioFile);
      setSound(newSound);
      await newSound.playAsync();
    } catch (error) {
      console.error('Error loading sound:', error);
    }
  };

  const playCurrentAudio = async () => {
    if (!currentAudioFile) return;
    await playAudioAlways(currentAudioFile);
  };

  const getButtonStyle = (index) => {
    let style = [styles.button];
    if (inactiveButtons.has(index)) {
      style.push(styles.deactivatedButton);
    }
    if (selectedAnswer === index) {
      if (displayPairs[index].entext === verbs[currentIndex].entext) {
        style.push(styles.correctButton);
      } else {
        style.push(styles.wrongButton);
      }
    }
    return style;
  };

  const getImageForGender = (gender) => {
    switch (gender) {
      case 'man':
        return require('./man1.png');
      case 'woman':
        return require('./woman1.png');
      case 'men':
        return require('./men1.png');
      case 'women':
        return require('./women1.png');
      default:
        return null;
    }
  };

  const toggleDescriptionModal = () => {
    setDescriptionModalVisible((prev) => !prev);
  };

  const handleButton3Press = async () => {
    const exerciseId = 'exercise8En';
    try {
      const stats = await getStatistics(exerciseId);
      setStatistics(stats);
      setIsStatModalVisible(true);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
      setStatistics(null);
      setIsStatModalVisible(false);
    }
  };

  const handleSoundToggle = () => {
    setSoundEnabled(!soundEnabled);
    if (soundEnabled && sound) {
      sound.setVolumeAsync(0);
    } else if (!soundEnabled && sound) {
      sound.setVolumeAsync(1);
    }
  };

  const handleBackButtonPress = () => {
    setExitConfirmationVisible(true);
    return true;
  };

  useFocusEffect(
                  useCallback(() => {
                    const onBackPress = () => {
                      if (exitConfirmationVisible) {
                        return false;
                      }
                      setExitConfirmationVisible(true);
                      return true;
                    };
                
                    const backHandler = BackHandler.addEventListener(
                      'hardwareBackPress',
                      onBackPress
                    );
                
                    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
                      if (!exitConfirmationVisible) {
                        e.preventDefault(); // Блокируем навигацию назад
                        setExitConfirmationVisible(true); // Показываем модалку
                      }
                    });
                
                    return () => {
                      backHandler.remove();
                      unsubscribe();
                    };
                  }, [exitConfirmationVisible, navigation])
                );
      
        useEffect(() => {
            navigation.setOptions({
              headerLeft: () => null, // Убирает кнопку "Назад" в заголовке
            });
          }, [navigation]);
    
          const handleConfirmExit = () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'MenuEn' }],
            });
          };
    
      const handleCancelExit = () => {
        setExitConfirmationVisible(false);
      };

  const handleExerciseCompletion = async () => {
    const exerciseId = 'exercise8En';
    const currentScore = parseFloat(progressPercent.toFixed(2));
    await updateStatistics(exerciseId, currentScore);

    setExerciseCompleted(true);
    setTimeout(() => {
      setCompletionMessageVisible(true);
      Animated.timing(completionMessageOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 600);
  };

const resetExercise = () => {
  setCorrectCount(0);
  setIncorrectCount(0);
  setProgress(0);
  setExerciseCompleted(false);
  setCurrentIndex(0);
  setCorrectAnswers(new Set());

  // Новый запуск — открываем выбор глагола заново
  const uniqueVerbs = [...new Set(verbsData.map(item => item.infinitive))];
  const selectedInfinitive = uniqueVerbs[Math.floor(Math.random() * uniqueVerbs.length)];
  const allForms = verbsData.filter(verb => verb.infinitive === selectedInfinitive);

  setMainVerb(allForms[0]);
  setVerbListForModal(allForms);
  setIsVerbListVisible(true);
  setPendingVerb(null);
};

  // const [SearchModalVisible, setSearchModalVisible] = useState(false);

  const handleSearchButtonPress = () => {
  setIsSearchModalVisible(true);
};


  const progressPercent = (correctCount / (correctCount + incorrectCount)) * 100 || 0;

  const handleNextPress = () => {
    if (!exerciseCompleted) {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % verbs.length);
      setNextButtonEnabled(false);
      setInactiveButtons(new Set());
      setSelectedAnswer(null);
      setIsCorrectAnswerSelected(false);
      setShowInfinitive(false);
      setShowTranslation(false);
    }
  };

  const handleContinue = async () => {
    if (!exerciseCompleted) {
      await handleExerciseCompletion();
    }
    setCompletionMessageVisible(false);
    resetExercise();
  };

  const handleSearchToggle = () => {
    setIsSearchModalVisible((prev) => !prev);
  };

 const [pendingVerb, setPendingVerb] = useState(null);

const [initializedBySearch, setInitializedBySearch] = useState(false);

const handleSelectVerb = (verb) => {
  setPendingVerb(verb);
  const allForms = verbsData.filter(item => item.infinitive === verb.infinitive);
  setVerbListForModal(allForms);
  setIsVerbListVisible(true);
  setIsSearchModalVisible(false); // <-- главное
};



const handleStartExercise = () => {
  const chosenVerb = pendingVerb || mainVerb;
  if (!chosenVerb) return;
  initializeExercise(chosenVerb);
  setIsVerbListVisible(false);
  setPendingVerb(null);
};




const [currentVerb, setCurrentVerb] = useState({
    infinitive: '',
    english: '',
    transliteration: ''
  });

   return (
  <>
    {isVerbListVisible && (
      <VerbListModal2
  visible={isVerbListVisible}
  language={language}
  verbs={verbListForModal}
  onStartExercise={handleStartExercise}
  onClose={() => setIsVerbListVisible(false)} // на всякий случай, если понадобится
/>

      
    )}

    {!isVerbListVisible && (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.container}>
      <View style={styles.topBar}>
        <Animated.Image source={require('./VERBIFY.png')} style={[styles.logoImage, { opacity: fadeAnim }]} />
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={handleSoundToggle}>
            <Animated.Image
              source={soundEnabled ? require('./SoundOn.png') : require('./SoundOff.png')}
              style={[styles.buttonImage, { opacity: fadeAnim }]}
            />
          </TouchableOpacity>
          {/* <TouchableOpacity onPress={handleButton3Press}>
            <Animated.Image source={require('./stat.png')} style={[styles.buttonImage, { opacity: fadeAnim }]} />
            <StatModal8En visible={isStatModalVisible} onToggle={() => setIsStatModalVisible(false)} statistics={statistics} />
          </TouchableOpacity> */}

<TouchableOpacity onPress={handleButton3Press}>
  <Animated.Image
    source={require('./stat.png')}
    style={[styles.buttonImage, { opacity: fadeAnim }]}
  />
</TouchableOpacity>


          <TouchableOpacity onPress={toggleDescriptionModal}>
            <Animated.Image source={require('./question.png')} style={[styles.buttonImage, { opacity: fadeAnim }]} />
            <TaskDescriptionModal6
              visible={isDescriptionModalVisible}
  onToggle={toggleDescriptionModal}
  language={language}
  dontShowAgain8={dontShowAgain8}
  onToggleDontShowAgain={handleToggleDontShowAgain8}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSearchToggle}>
            <Animated.Image source={require('./search1.png')} style={[styles.buttonImage, { opacity: fadeAnim }]} />
          </TouchableOpacity>
        </View>
      </View>
      <Animated.View style={[styles.progressContainer, { opacity: fadeAnim }]}>
        <View style={styles.textContainer}>
          <Text style={styles.prtext}maxFontSizeMultiplier={1.2}>CORRECT: {correctCount}</Text>
          <Text style={styles.prtext}maxFontSizeMultiplier={1.2}>INCORRECT: {incorrectCount}</Text>
        </View>
        <View style={styles.remainingTasksContainer}>
          <Text style={styles.remainingTasksText}maxFontSizeMultiplier={1.2}>{totalConjugations - currentIndex}</Text>
        </View>
        <Animated.View style={[styles.percentContainer, { backgroundColor, borderRadius: 10 }]}>
          <Text style={styles.percentText}maxFontSizeMultiplier={1.2}>{progressPercent.toFixed(2)}%</Text>
        </Animated.View>
      </Animated.View>
      <Animated.View style={[styles.ProgressBarcontainer, { opacity: fadeAnim }]}>
        <ProgressBar progress={progress} totalExercises={100} />
      </Animated.View>
      <Animated.Text style={[styles.title, { opacity: fadeAnim }]}maxFontSizeMultiplier={1.2}>CONJUGATE THE VERB</Animated.Text>

      <View style={styles.verbContainerWrapper}>
        <Animated.View style={[styles.verbContainer, { opacity: fadeAnim }]}>
          {verbs[currentIndex] && (
            <>
              <Text style={styles.verbText}maxFontSizeMultiplier={1.2}>{verbs[currentIndex].infinitive}</Text>
              <Text style={styles.verbTextTr}maxFontSizeMultiplier={1.2}>{verbs[currentIndex].transliteration}</Text>
              <Text style={styles.verbTextRu}maxFontSizeMultiplier={1.2}>{verbs[currentIndex].english}</Text>
              <TouchableOpacity onPress={() => playInfinitiveAudio(verbs[currentIndex].audioFile)} style={styles.audioButton1}>
                <Image source={require('./speaker3.png')} style={styles.audioIcon1} />
              </TouchableOpacity>
            </>
          )}
        </Animated.View>
      </View>

      <View style={styles.hebrewCardContainer}>
        {verbs[currentIndex] && (
          <View style={styles.hebrewCard}>
            {isAnimationVisible && (
              <LottieView
                source={require('./assets/Animation - 1718430107767.json')}
                autoPlay
                loop={false}
                style={styles.lottie}
                onAnimationFinish={() => setIsAnimationVisible(false)}
              />
            )}
            <TypewriterTextRTL text={verbs[currentIndex].hebrewtext} typingSpeed={50} style={styles.hebrewText}maxFontSizeMultiplier={1.2} />
            <TypewriterTextLTR text={verbs[currentIndex].translit} typingSpeed={40} style={styles.translitText}maxFontSizeMultiplier={1.2} />
            <TouchableOpacity onPress={playCurrentAudio} style={styles.audioButton}>
              <Image source={require('./speaker3.png')} style={styles.audioIcon} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Animated.View style={{ transform: [{ translateY: blockAnimation }] }}>
        <View style={styles.answerContainer}>
          {displayPairs.map((pair, index) => (
            <TouchableOpacity
              key={index}
              style={getButtonStyle(index)}
              onPress={() => handleAnswer(index)}
              disabled={inactiveButtons.has(index) || isCorrectAnswerSelected}
            >
              <Text
                style={[
                  styles.text,
                  styles.russianText,
                  inactiveButtons.has(index) ? styles.deactivatedButtonText : {},
                ]} maxFontSizeMultiplier={1.2}
              >
                {pair.entext}
              </Text>
              {pair.gender && <Image source={getImageForGender(pair.gender)} style={styles.iconStyle} />}
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      <TouchableOpacity
        style={[styles.nextButton, nextButtonEnabled ? styles.nextButtonActive : styles.nextButtonInactive]}
        onPress={handleNextPress}
        disabled={!nextButtonEnabled}
      >
        <Text style={styles.nextButtonText}maxFontSizeMultiplier={1.2}>NEXT</Text>
      </TouchableOpacity>

      {completionMessageVisible && (
        <Animated.View style={[styles.completionMessageContainer, { opacity: completionMessageOpacity }]}>
          <CompletionMessageEn
            handleOK={handleContinue}
            navigateToMenu={() => {
              setCompletionMessageVisible(false);
              navigation.navigate('MenuEn');
            }}
            correctAnswers={correctCount}
            incorrectAnswers={incorrectCount}
            correctAnswersPercentage={progressPercent.toFixed(2)}
            grade={getGrade(progressPercent)}
            restartTask={resetExercise}
          />
        </Animated.View>
      )}

      <ExitConfirmationModal visible={exitConfirmationVisible} onCancel={handleCancelExit} onConfirm={handleConfirmExit} />
      <SearchModalEn visible={isSearchModalVisible} onToggle={handleSearchToggle} onSelectVerb={handleSelectVerb} />
      </View>
    </ScrollView>
   )}

    {/* Модалки должны быть вне ScrollView/TouchableOpacity */}
    <StatModal8En
      visible={isStatModalVisible}
      onToggle={() => setIsStatModalVisible(false)}
      statistics={statistics}
    />

    <TaskDescriptionModal6
      visible={isDescriptionModalVisible}
      onToggle={toggleDescriptionModal}
      language={language}
      dontShowAgain8={dontShowAgain8}
      onToggleDontShowAgain={handleToggleDontShowAgain8}
    />
  </>
);
};

const styles = StyleSheet.create({

  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#AFC1D0',
    height: '100%',
    width: '100%',
    

  },

  // containerbox: {
  //   flex: 1,
  //   backgroundColor: "#AFC1D0",
  //   justifyContent: 'center',
  //   padding: 10,
  // },

  completionMessageContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingTop: 5,
    
  },
  logoImage: {
    width: 90,
    height: 90,
    marginLeft: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginRight: 10,
  },
  buttonImage: {
    width: 44,
    height: 44,
    marginLeft: 10,
  },
  
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: 50,
    backgroundColor: '#6C8EBB',
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    width: '50%',
  },
  prtext: {
    fontSize: 12,
    color: 'white',
    textAlign: 'left',
    marginLeft: 15,
  },
  percentContainer: {
    alignItems: 'center',
    marginRight: 10,
  },
  percentText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    borderRadius: 10,
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 10,
  },
  remainingTasksContainer: {
    alignItems: 'center',
    marginRight: 10,
  },
  remainingTasksText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: '#83A3CD',
    borderRadius: 10,
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 10,
  },
  ProgressBarcontainer: {
    width: '100%',
    marginBottom: 5
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
    marginBottom: 5,
    color: '#2F4766',
    textAlign: 'center',
  },
  verbContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 5,
    marginBottom: 10,
    backgroundColor: '#FFFDEF',
    borderRadius: 10,
    marginLeft: 5,
    marginRight: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    height: 40,
    width: '100%',
  },
  verbText: {
    fontSize: 15,
    color: '#FF5757',
    fontWeight: 'bold',
    textAlign: 'center',
    marginLeft: 10,
  },
  verbTextTr: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  verbTextRu: {
    fontSize: 14,
    color: '#003882',
    textAlign: 'center',
  },
  verbTextActive: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
  },
  translationButton: {
    backgroundColor: '#6C8EBB',
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRadius: 5,
    width: 120,
    alignItems: 'center',
  },
  audioIcon: {
    width: 26,
    height: 26,
  },
  audioIcon1: {
    width: 22,
    height: 22,
    marginRight: 5,
  },
  audioButton: {
    position: 'absolute',
    bottom: 10,
    right: 14,
  },
  hebrewCardContainer: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 10,
  },
  hebrewCard: {
    backgroundColor: '#FFFDEF',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  hebrewText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#152039',
    textAlign: 'center',
  },
  translitText: {
    fontSize: 20,
    color: '#FF5757',
    fontWeight: 'bold',
    marginTop: 5,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
    width: '100%',
  },
  answerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    width: '48%',
    marginVertical: 5,
    padding: 5,
    backgroundColor: '#D1E3F1',
    borderRadius: 10,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    flexWrap: 'wrap',
  },
  russianButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  text: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  russianText: {
    textAlign: 'left',
    flex: 1,
    marginLeft: 3,
    color: '#152039',
  },
  iconStyle: {
    width: 45,
    height: 45,
  },
  selectedButton: {
    backgroundColor: '#AFFFCA',
  },
  correctButton: {
    backgroundColor: '#AFFFCA',
  },
  wrongButton: {
    backgroundColor: '#FFBCBC',
  },
  deactivatedButton: {
    backgroundColor: '#E0E0E0',
  },
  deactivatedButtonText: {
    color: '#A0A0A0',
  },
  verbContainerWrapper: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 5,
    height: 40,
  },
  inactiveButton: {
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    height: '100%',
    alignItems: 'center',
    width: '100%',
    marginLeft: 5,
    marginRight: 5,
  },
  activeButton: {
    backgroundColor: '#6C8EBB',
    justifyContent: 'center',
    height: '100%',
    alignItems: 'center',
    width: '100%',
    marginLeft: 5,
    marginRight: 5,
  },
  verbTextInactive: {
    fontSize: 14,
    color: '#A0A0A0',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  verbTextActive: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  nextButton: {
    width: '80%',
    // height: 40,
    padding: hp('1.5%'),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  nextButtonActive: {
    backgroundColor: '#6C8EBB',
  },
  nextButtonInactive: {
    backgroundColor: '#E0E0E0',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  lottie: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 32,
    height: 32,
  },
});

export default Exercise8En;
