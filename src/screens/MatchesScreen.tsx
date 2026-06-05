import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api/client';
import { RootStackParamList } from '../navigation/AppNavigator';
import type { Match, WinnerTeam } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Matches'>;

function formatTeam(
  p1: { name: string },
  p2: { name: string },
): string {
  return `${p1.name} / ${p2.name}`;
}

export default function MatchesScreen({ route }: Props) {
  const { tournamentId } = route.params;
  const [matches, setMatches] = useState<Match[]>([]);
  const [selected, setSelected] = useState<Match | null>(null);
  const [scoreA, setScoreA] = useState('');
  const [scoreB, setScoreB] = useState('');

  const load = useCallback(async () => {
    const { data } = await api.get<Match[]>(`/tournaments/${tournamentId}/matches`);
    setMatches(data);
  }, [tournamentId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const saveResult = async () => {
    if (!selected) return;
    try {
      await api.patch(
        `/tournaments/${tournamentId}/matches/${selected.id}/result`,
        {
          teamAScore: parseInt(scoreA, 10),
          teamBScore: parseInt(scoreB, 10),
        },
      );
      setSelected(null);
      load();
    } catch {
      Alert.alert('Erro', 'Placar inválido para a configuração do torneio.');
    }
  };

  const markWalkover = async (winner: WinnerTeam) => {
    if (!selected) return;
    try {
      await api.post(
        `/tournaments/${tournamentId}/matches/${selected.id}/walkover`,
        { winnerTeam: winner },
      );
      setSelected(null);
      load();
    } catch {
      Alert.alert('Erro', 'Não foi possível marcar W.O.');
    }
  };

  const rounds = [...new Set(matches.map((m) => m.round))].sort((a, b) => a - b);

  return (
    <View style={styles.container}>
      <FlatList
        data={rounds}
        keyExtractor={(r) => String(r)}
        renderItem={({ item: round }) => (
          <View style={styles.round}>
            <Text style={styles.roundTitle}>Rodada {round}</Text>
            {matches
              .filter((m) => m.round === round)
              .map((m) => (
                <Pressable
                  key={m.id}
                  style={styles.match}
                  onPress={() => {
                    if (m.status === 'PENDING') {
                      setSelected(m);
                      setScoreA('');
                      setScoreB('');
                    }
                  }}
                >
                  <Text style={styles.court}>Quadra {m.courtNumber ?? '-'}</Text>
                  <Text>{formatTeam(m.teamA.player1, m.teamA.player2)}</Text>
                  <Text style={styles.vs}>x</Text>
                  <Text>{formatTeam(m.teamB.player1, m.teamB.player2)}</Text>
                  <Text style={styles.status}>
                    {m.status === 'PENDING'
                      ? 'Toque para registrar'
                      : `${m.teamAScore}x${m.teamBScore} (${m.status})`}
                  </Text>
                </Pressable>
              ))}
          </View>
        )}
      />

      <Modal visible={!!selected} transparent animationType="slide">
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Resultado</Text>
          <View style={styles.scoreRow}>
            <TextInput
              style={styles.scoreInput}
              keyboardType="number-pad"
              placeholder="A"
              value={scoreA}
              onChangeText={setScoreA}
            />
            <Text>x</Text>
            <TextInput
              style={styles.scoreInput}
              keyboardType="number-pad"
              placeholder="B"
              value={scoreB}
              onChangeText={setScoreB}
            />
          </View>
          <Pressable style={styles.btn} onPress={saveResult}>
            <Text style={styles.btnText}>Salvar placar</Text>
          </Pressable>
          <Pressable style={styles.woBtn} onPress={() => markWalkover('TEAM_A')}>
            <Text>W.O. — vitória dupla A</Text>
          </Pressable>
          <Pressable style={styles.woBtn} onPress={() => markWalkover('TEAM_B')}>
            <Text>W.O. — vitória dupla B</Text>
          </Pressable>
          <Pressable onPress={() => setSelected(null)}>
            <Text style={styles.cancel}>Cancelar</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0fdfa', padding: 16 },
  round: { marginBottom: 20 },
  roundTitle: { fontSize: 18, fontWeight: '700', color: '#0f766e', marginBottom: 8 },
  match: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 8 },
  court: { fontSize: 12, color: '#64748b' },
  vs: { textAlign: 'center', color: '#94a3b8' },
  status: { marginTop: 6, fontWeight: '600', color: '#0d9488' },
  modal: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 24 },
  modalTitle: { backgroundColor: '#fff', padding: 16, borderTopLeftRadius: 12, borderTopRightRadius: 12, fontWeight: '700', fontSize: 18 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: '#fff', padding: 16 },
  scoreInput: { borderWidth: 1, borderColor: '#ccc', width: 60, textAlign: 'center', padding: 8, borderRadius: 6 },
  btn: { backgroundColor: '#0d9488', padding: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600' },
  woBtn: { backgroundColor: '#fff', padding: 12, alignItems: 'center', borderTopWidth: 1, borderColor: '#eee' },
  cancel: { backgroundColor: '#fff', padding: 16, textAlign: 'center', borderBottomLeftRadius: 12, borderBottomRightRadius: 12, color: '#64748b' },
});
