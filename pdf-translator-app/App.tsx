import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HomeScreen } from './src/screens/HomeScreen';
import { ReaderScreen } from './src/screens/ReaderScreen';
import { VocabularyScreen } from './src/screens/VocabularyScreen';
import { RootStackParamList } from './src/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: '#FAFAFA' },
            headerTintColor: '#1F2937',
            headerTitleStyle: { fontWeight: '700' },
            headerShadowVisible: false,
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={({ navigation }) => ({
              title: 'PDF Translator',
              headerRight: () => (
                <TouchableOpacity
                  onPress={() => navigation.navigate('Vocabulary')}
                  style={styles.vocabBtn}
                >
                  <Text style={styles.vocabBtnText}>📚 Vocabulário</Text>
                </TouchableOpacity>
              ),
            })}
          />
          <Stack.Screen
            name="Reader"
            component={ReaderScreen}
            options={{
              title: '',
              headerBackTitle: 'Voltar',
            }}
          />
          <Stack.Screen
            name="Vocabulary"
            component={VocabularyScreen}
            options={{ title: 'Vocabulário Aprendido' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  vocabBtn: {
    paddingHorizontal: 4,
  },
  vocabBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
});
