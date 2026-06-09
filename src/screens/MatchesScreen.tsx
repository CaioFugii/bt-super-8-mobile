import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api/client';
import AppTextInput from '../components/AppTextInput';
import { RootStackParamList } from '../navigation/AppNavigator';
import type { Match, WinnerTeam } from '../types';
import { extractApiErrorMessage } from '../utils/apiError';
import { confirmAction } from '../utils/confirmAction';
import { showError, showSuccess } from '../utils/feedback';

type Props = NativeStackScreenProps<RootStackParamList, 'Matches'>;

function formatTeam(p1: { name: string }, p2: { name: string }): string {
  return `${p1.name} / ${p2.name}`;
}

export default function MatchesScreen({ route }: Props) {
  const { tournamentId } = route.params;
  const [matches, setMatches] = useState<Match[]>([]);
  const [selected, setSelected] = useState<Match | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [scoreA, setScoreA] = useState('');
  const [scoreB, setScoreB] = useState('');
  const [processing, setProcessing] = useState(false);

  const load = useCallback(async () => {
    const { data } = await api.get<Match[]>(`/tournaments/${tournamentId}/matches`);
    setMatches(data);
  }, [tournamentId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const openMatch = (match: Match) => {
    if (match.status === 'PENDING') {
      setIsEditing(false);
      setSelected(match);
      setScoreA('');
      setScoreB('');
      return;
    }
    if (match.status === 'FINISHED' || match.status === 'WALKOVER') {
      setIsEditing(true);
      setSelected(match);
      setScoreA(String(match.teamAScore ?? ''));
      setScoreB(String(match.teamBScore ?? ''));
    }
  };

  const saveResult = async () => {
    if (!selected || processing) return;

    const confirmed = await confirmAction({
      title: isEditing ? 'Editar placar?' : 'Confirmar placar?',
      message: isEditing
        ? 'O ranking será recalculado com base no novo resultado.'
        : 'Este resultado atualizará o ranking do torneio.',
      confirmLabel: isEditing ? 'Salvar alteração' : 'Salvar placar',
    });
    if (!confirmed) return;

    setProcessing(true);
    try {
      const endpoint = isEditing
        ? `/tournaments/${tournamentId}/matches/${selected.id}/result/edit`
        : `/tournaments/${tournamentId}/matches/${selected.id}/result`;

      await api.patch(endpoint, {
        teamAScore: parseInt(scoreA, 10),
        teamBScore: parseInt(scoreB, 10),
      });
      showSuccess('Placar salvo com sucesso.');
      setSelected(null);
      load();
    } catch (e) {
      showError(extractApiErrorMessage(e));
    } finally {
      setProcessing(false);
    }
  };

  const markWalkover = async (winner: WinnerTeam) => {
    if (!selected || processing) return;

    const confirmed = await confirmAction({
      title: 'Marcar W.O.?',
      message:
        'A dupla adversária será declarada vencedora e o ranking será atualizado.',
      confirmLabel: 'Marcar W.O.',
    });
    if (!confirmed) return;

    setProcessing(true);
    try {
      await api.post(
        `/tournaments/${tournamentId}/matches/${selected.id}/walkover`,
        { winnerTeam: winner },
      );
      showSuccess('W.O. registrado.');
      setSelected(null);
      load();
    } catch (e) {
      showError(extractApiErrorMessage(e));
    } finally {
      setProcessing(false);
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
                <Pressable key={m.id} style={styles.match} onPress={() => openMatch(m)}>
                  <Text style={styles.court}>Quadra {m.courtNumber ?? '-'}</Text>
                  <Text>{formatTeam(m.teamA.player1, m.teamA.player2)}</Text>
                  <Text style={styles.vs}>x</Text>
                  <Text>{formatTeam(m.teamB.player1, m.teamB.player2)}</Text>
                  <Text style={styles.status}>
                    {m.status === 'PENDING'
                      ? 'Toque para registrar'
                      : `${m.teamAScore}x${m.teamBScore} (${m.status}) — toque para editar`}
                  </Text>
                </Pressable>
              ))}
          </View>
        )}
      />

      <Modal visible={!!selected} transparent animationType="slide">
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>
            {isEditing ? 'Editar resultado' : 'Resultado'}
          </Text>
          <View style={styles.scoreRow}>
            <AppTextInput
              style={styles.scoreInput}
              keyboardType="number-pad"
              placeholder="A"
              value={scoreA}
              onChangeText={setScoreA}
              editable={!processing}
            />
            <Text>x</Text>
            <AppTextInput
              style={styles.scoreInput}
              keyboardType="number-pad"
              placeholder="B"
              value={scoreB}
              onChangeText={setScoreB}
              editable={!processing}
            />
          </View>
          <Pressable
            style={[styles.btn, processing && styles.disabled]}
            onPress={saveResult}
            disabled={processing}
          >
            {processing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>
                {isEditing ? 'Salvar alteração' : 'Salvar placar'}
              </Text>
            )}
          </Pressable>
          {!isEditing && (
            <>
              <Pressable
                style={[styles.woBtn, processing && styles.disabled]}
                onPress={() => markWalkover('TEAM_A')}
                disabled={processing}
              >
                <Text>W.O. — vitória dupla A</Text>
              </Pressable>
              <Pressable
                style={[styles.woBtn, processing && styles.disabled]}
                onPress={() => markWalkover('TEAM_B')}
                disabled={processing}
              >
                <Text>W.O. — vitória dupla B</Text>
              </Pressable>
            </>
          )}
          <Pressable onPress={() => !processing && setSelected(null)} disabled={processing}>
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
  disabled: { opacity: 0.6 },
});
