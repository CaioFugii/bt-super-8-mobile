import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api/client';
import AppTextInput from '../components/AppTextInput';
import { RootStackParamList } from '../navigation/AppNavigator';
import type { Gender, Participant, Tournament } from '../types';
import { extractApiErrorMessage } from '../utils/apiError';
import { confirmAction } from '../utils/confirmAction';
import { showError, showSuccess } from '../utils/feedback';

type Props = NativeStackScreenProps<RootStackParamList, 'Participants'>;

const GENDER_LABEL: Record<Gender, string> = {
  MALE: 'Homem',
  FEMALE: 'Mulher',
};

export default function ParticipantsScreen({ route }: Props) {
  const { tournamentId } = route.params;
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>('MALE');
  const [processing, setProcessing] = useState(false);

  const isMixed = tournament?.format === 'SUPER_8_MIXED';
  const maleCount = participants.filter((p) => p.gender === 'MALE').length;
  const femaleCount = participants.filter((p) => p.gender === 'FEMALE').length;

  const load = useCallback(async () => {
    const [p, t] = await Promise.all([
      api.get<Participant[]>(`/tournaments/${tournamentId}/participants`),
      api.get<Tournament>(`/tournaments/${tournamentId}`),
    ]);
    setParticipants(p.data);
    setTournament(t.data);
  }, [tournamentId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const add = async () => {
    if (!name.trim()) return;
    if (isMixed && !gender) {
      Alert.alert('Erro', 'Selecione o gênero do participante.');
      return;
    }
    try {
      await api.post(`/tournaments/${tournamentId}/participants`, {
        name: name.trim(),
        ...(isMixed ? { gender } : {}),
      });
      setName('');
      load();
    } catch (e) {
      showError(extractApiErrorMessage(e));
    }
  };

  const remove = async (id: string) => {
    const confirmed = await confirmAction({
      title: 'Remover participante?',
      message: 'Este participante será removido do torneio.',
      confirmLabel: 'Remover',
      destructive: true,
    });
    if (!confirmed || processing) return;

    setProcessing(true);
    try {
      await api.delete(`/tournaments/${tournamentId}/participants/${id}`);
      load();
    } catch (e) {
      showError(extractApiErrorMessage(e));
    } finally {
      setProcessing(false);
    }
  };

  const withdraw = async (id: string) => {
    const confirmed = await confirmAction({
      title: 'Marcar desistência?',
      message:
        'As partidas pendentes deste participante serão processadas como W.O. ou canceladas conforme as regras do torneio.',
      confirmLabel: 'Confirmar desistência',
    });
    if (!confirmed || processing) return;

    setProcessing(true);
    try {
      await api.post(`/tournaments/${tournamentId}/participants/${id}/withdraw`, {});
      showSuccess('Participante marcado como desistente.');
      load();
    } catch (e) {
      showError(extractApiErrorMessage(e));
    } finally {
      setProcessing(false);
    }
  };

  const canEdit = tournament?.status === 'DRAFT';
  const canWithdraw = tournament?.status === 'IN_PROGRESS';

  return (
    <View style={styles.container}>
      <Text style={styles.count}>
        {isMixed
          ? `Homens: ${maleCount}/4 · Mulheres: ${femaleCount}/4`
          : `${participants.length}/8 participantes`}
      </Text>
      {canEdit && (
        <>
          {isMixed && (
            <View style={styles.genderRow}>
              {(['MALE', 'FEMALE'] as const).map((g) => (
                <Pressable
                  key={g}
                  style={[styles.genderBtn, gender === g && styles.genderBtnActive]}
                  onPress={() => setGender(g)}
                >
                  <Text
                    style={[
                      styles.genderBtnText,
                      gender === g && styles.genderBtnTextActive,
                    ]}
                  >
                    {GENDER_LABEL[g]}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
          <View style={styles.addRow}>
            <AppTextInput
              style={styles.input}
              placeholder="Nome do participante"
              value={name}
              onChangeText={setName}
            />
            <Pressable style={styles.addBtn} onPress={add}>
              <Text style={styles.addBtnText}>+</Text>
            </Pressable>
          </View>
        </>
      )}
      <FlatList
        data={participants}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardInfo}>
              <Text style={styles.name}>
                {item.name}
                {item.status === 'WITHDRAWN' ? ' (desistente)' : ''}
              </Text>
              {isMixed && item.gender && (
                <Text style={styles.genderBadge}>{GENDER_LABEL[item.gender]}</Text>
              )}
            </View>
            {canEdit && (
              <Pressable onPress={() => remove(item.id)}>
                <Text style={styles.remove}>Remover</Text>
              </Pressable>
            )}
            {canWithdraw && item.status === 'ACTIVE' && (
              <Pressable onPress={() => withdraw(item.id)}>
                <Text style={styles.withdraw}>Desistência</Text>
              </Pressable>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f0fdfa' },
  count: { fontWeight: '600', marginBottom: 12, color: '#134e4a' },
  genderRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  genderBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
  },
  genderBtnActive: { backgroundColor: '#0d9488' },
  genderBtnText: { color: '#134e4a', fontWeight: '500' },
  genderBtnTextActive: { color: '#fff' },
  addRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#99f6e4',
  },
  addBtn: {
    backgroundColor: '#0d9488',
    width: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnText: { color: '#fff', fontSize: 24 },
  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardInfo: { flex: 1 },
  name: { fontSize: 16, color: '#134e4a' },
  genderBadge: { fontSize: 12, color: '#64748b', marginTop: 2 },
  remove: { color: '#dc2626' },
  withdraw: { color: '#d97706' },
});
