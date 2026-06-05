import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api/client';
import { RootStackParamList } from '../navigation/AppNavigator';
import type { Tournament } from '../types';
import { FORMAT_LABEL } from '../utils/tournamentFormat';

type Props = NativeStackScreenProps<RootStackParamList, 'TournamentDetail'>;

export default function TournamentDetailScreen({ navigation, route }: Props) {
  const { tournamentId } = route.params;
  const [tournament, setTournament] = useState<Tournament | null>(null);

  const load = useCallback(async () => {
    const { data } = await api.get<Tournament>(`/tournaments/${tournamentId}`);
    setTournament(data);
  }, [tournamentId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const generateMatches = async () => {
    try {
      await api.post(`/tournaments/${tournamentId}/matches/generate`);
      Alert.alert('Sucesso', '14 partidas geradas!');
      load();
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string | string[] } } })?.response
          ?.data?.message;
      Alert.alert('Erro', Array.isArray(msg) ? msg.join('\n') : msg ?? 'Falha ao gerar partidas');
    }
  };

  const finishTournament = async () => {
    try {
      await api.post(`/tournaments/${tournamentId}/finish`);
      Alert.alert('Torneio finalizado!');
      load();
    } catch {
      Alert.alert('Erro', 'Verifique se todas as partidas foram concluídas.');
    }
  };

  if (!tournament) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{tournament.name}</Text>
      <Text style={styles.meta}>
        {FORMAT_LABEL[tournament.format ?? 'SUPER_8']} · {tournament.date} ·{' '}
        {tournament.location ?? 'Sem local'} · {tournament.status}
      </Text>

      <Pressable style={styles.menuItem} onPress={() => navigation.navigate('Participants', { tournamentId })}>
        <Text style={styles.menuText}>
          Participantes{tournament.format === 'SUPER_8_MIXED' ? ' (4H + 4M)' : ' (8)'}
        </Text>
      </Pressable>
      <Pressable style={styles.menuItem} onPress={() => navigation.navigate('Matches', { tournamentId })}>
        <Text style={styles.menuText}>Partidas</Text>
      </Pressable>
      <Pressable style={styles.menuItem} onPress={() => navigation.navigate('Ranking', { tournamentId })}>
        <Text style={styles.menuText}>Classificação</Text>
      </Pressable>
      <Pressable
        style={styles.menuItem}
        onPress={() => navigation.navigate('ShareTournament', { tournamentId })}
      >
        <Text style={styles.menuText}>Compartilhar com competidores</Text>
      </Pressable>

      {tournament.status === 'DRAFT' && (
        <>
          <Pressable style={styles.action} onPress={generateMatches}>
            <Text style={styles.actionText}>
              Gerar partidas {FORMAT_LABEL[tournament.format ?? 'SUPER_8']}
            </Text>
          </Pressable>
          <Pressable
            style={styles.secondary}
            onPress={() => navigation.navigate('TournamentForm', { tournamentId })}
          >
            <Text style={styles.secondaryText}>Editar torneio</Text>
          </Pressable>
        </>
      )}

      {tournament.status === 'IN_PROGRESS' && (
        <Pressable style={styles.action} onPress={finishTournament}>
          <Text style={styles.actionText}>Finalizar torneio</Text>
        </Pressable>
      )}

      {tournament.status === 'FINISHED' && (
        <>
          <Pressable
            style={styles.action}
            onPress={() => navigation.navigate('SocialCard', { tournamentId })}
          >
            <Text style={styles.actionText}>Card Instagram</Text>
          </Pressable>
          {tournament.enableForfeitChallenge && (
            <Pressable
              style={styles.secondary}
              onPress={() => navigation.navigate('Challenge', { tournamentId })}
            >
              <Text style={styles.secondaryText}>Troféu Frango</Text>
            </Pressable>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f0fdfa' },
  title: { fontSize: 22, fontWeight: '700', color: '#134e4a' },
  meta: { color: '#64748b', marginBottom: 20, marginTop: 4 },
  menuItem: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#99f6e4' },
  menuText: { fontSize: 16, color: '#134e4a' },
  action: { backgroundColor: '#0d9488', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  actionText: { color: '#fff', fontWeight: '600' },
  secondary: { borderWidth: 1, borderColor: '#0d9488', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  secondaryText: { color: '#0d9488', fontWeight: '600' },
});
