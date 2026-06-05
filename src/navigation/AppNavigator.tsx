import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import TournamentFormScreen from '../screens/TournamentFormScreen';
import TournamentDetailScreen from '../screens/TournamentDetailScreen';
import ParticipantsScreen from '../screens/ParticipantsScreen';
import MatchesScreen from '../screens/MatchesScreen';
import RankingScreen from '../screens/RankingScreen';
import SocialCardScreen from '../screens/SocialCardScreen';
import ChallengeScreen from '../screens/ChallengeScreen';
import ShareTournamentScreen from '../screens/ShareTournamentScreen';
import { ActivityIndicator, View } from 'react-native';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  TournamentForm: { tournamentId?: string };
  TournamentDetail: { tournamentId: string };
  Participants: { tournamentId: string };
  Matches: { tournamentId: string };
  Ranking: { tournamentId: string };
  SocialCard: { tournamentId: string };
  Challenge: { tournamentId: string };
  ShareTournament: { tournamentId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { organizer, isHydrated } = useAuthStore();

  if (!isHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0d9488" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#0f766e' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '600' },
        }}
      >
        {!organizer ? (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ title: 'Entrar' }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ title: 'Cadastro' }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: 'Meus Torneios' }}
            />
            <Stack.Screen
              name="TournamentForm"
              component={TournamentFormScreen}
              options={{ title: 'Torneio' }}
            />
            <Stack.Screen
              name="TournamentDetail"
              component={TournamentDetailScreen}
              options={{ title: 'Detalhes' }}
            />
            <Stack.Screen
              name="Participants"
              component={ParticipantsScreen}
              options={{ title: 'Participantes' }}
            />
            <Stack.Screen
              name="Matches"
              component={MatchesScreen}
              options={{ title: 'Partidas' }}
            />
            <Stack.Screen
              name="Ranking"
              component={RankingScreen}
              options={{ title: 'Classificação' }}
            />
            <Stack.Screen
              name="SocialCard"
              component={SocialCardScreen}
              options={{ title: 'Card Instagram' }}
            />
            <Stack.Screen
              name="Challenge"
              component={ChallengeScreen}
              options={{ title: 'Troféu Frango' }}
            />
            <Stack.Screen
              name="ShareTournament"
              component={ShareTournamentScreen}
              options={{ title: 'Compartilhar' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
