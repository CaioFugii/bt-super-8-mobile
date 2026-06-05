import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api/client';
import { RootStackParamList } from '../navigation/AppNavigator';
import type { Tournament } from '../types';
import { extractApiErrorMessage } from '../utils/apiError';
import { confirmAction } from '../utils/confirmAction';
import { formatDate } from '../utils/formatDate';
import { showError, showSuccess } from '../utils/feedback';
import { FORMAT_LABEL } from '../utils/tournamentFormat';

type Props = NativeStackScreenProps<RootStackParamList, 'TournamentDetail'>;

export default function TournamentDetailScreen({ navigation, route }: Props) {
  const { tournamentId } = route.params;
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [processing, setProcessing] = useState(false);

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
    const confirmed = await confirmAction({
      title: 'Gerar partidas?',
      message:
        'As partidas serão criadas automaticamente e o torneio será iniciado.\n\nApós isso, não será possível alterar participantes ou quantidade de quadras.',
      confirmLabel: 'Gerar partidas',
    });
    if (!confirmed) return;

    setProcessing(true);
    try {
      await api.post(`/tournaments/${tournamentId}/matches/generate`);
      showSuccess('Partidas geradas com sucesso.');
      load();
    } catch (e) {
      showError(extractApiErrorMessage(e));
    } finally {
      setProcessing(false);
    }
  };

  const finishTournament = async () => {
    const confirmed = await confirmAction({
      title: 'Finalizar torneio?',
      message:
        'Após finalizar, o ranking final será definido e o torneio ficará disponível apenas para consulta.',
      confirmLabel: 'Finalizar torneio',
    });
    if (!confirmed) return;

    setProcessing(true);
    try {
      await api.post(`/tournaments/${tournamentId}/finish`);
      showSuccess('Torneio finalizado.');
      load();
    } catch (e) {
      showError(extractApiErrorMessage(e));
    } finally {
      setProcessing(false);
    }
  };

  const cancelTournament = async () => {
    const confirmed = await confirmAction({
      title: 'Cancelar torneio?',
      message: 'Esta ação encerrará o torneio como cancelado.',
      confirmLabel: 'Cancelar torneio',
      destructive: true,
    });
    if (!confirmed) return;

    setProcessing(true);
    try {
      await api.post(`/tournaments/${tournamentId}/cancel`);
      showSuccess('Torneio cancelado.');
      load();
    } catch (e) {
      showError(extractApiErrorMessage(e));
    } finally {
      setProcessing(false);
    }
  };

  if (!tournament) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {processing && (
        <View style={styles.processing}>
          <ActivityIndicator color="#0d9488" />
        </View>
      )}
      <Text style={styles.title}>{tournament.name}</Text>
      <Text style={styles.meta}>
        {FORMAT_LABEL[tournament.format ?? 'SUPER_8']} · {formatDate(tournament.date)} ·{' '}
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
          <Pressable
            style={[styles.action, processing && styles.disabled]}
            onPress={generateMatches}
            disabled={processing}
          >
            <Text style={styles.actionText}>
              {processing ? 'Gerando partidas...' : `Gerar partidas ${FORMAT_LABEL[tournament.format ?? 'SUPER_8']}`}
            </Text>
          </Pressable>
          <Pressable
            style={styles.secondary}
            onPress={() => navigation.navigate('TournamentForm', { tournamentId })}
          >
            <Text style={styles.secondaryText}>Editar torneio</Text>
          </Pressable>
          <Pressable
            style={[styles.dangerOutline, processing && styles.disabled]}
            onPress={cancelTournament}
            disabled={processing}
          >
            <Text style={styles.dangerText}>Cancelar torneio</Text>
          </Pressable>
        </>
      )}

      {tournament.status === 'IN_PROGRESS' && (
        <>
          <Pressable
            style={[styles.action, processing && styles.disabled]}
            onPress={finishTournament}
            disabled={processing}
          >
            <Text style={styles.actionText}>
              {processing ? 'Finalizando torneio...' : 'Finalizar torneio'}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.dangerOutline, processing && styles.disabled]}
            onPress={cancelTournament}
            disabled={processing}
          >
            <Text style={styles.dangerText}>Cancelar torneio</Text>
          </Pressable>
        </>
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
  processing: { marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '700', color: '#134e4a' },
  meta: { color: '#64748b', marginBottom: 20, marginTop: 4 },
  menuItem: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#99f6e4' },
  menuText: { fontSize: 16, color: '#134e4a' },
  action: { backgroundColor: '#0d9488', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  actionText: { color: '#fff', fontWeight: '600' },
  secondary: { borderWidth: 1, borderColor: '#0d9488', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  secondaryText: { color: '#0d9488', fontWeight: '600' },
  dangerOutline: { borderWidth: 1, borderColor: '#dc2626', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  dangerText: { color: '#dc2626', fontWeight: '600' },
  disabled: { opacity: 0.6 },
});
