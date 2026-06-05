import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { api } from '../api/client';
import { RootStackParamList } from '../navigation/AppNavigator';
import type { Tournament, TournamentFormat } from '../types';
import { FORMAT_LABEL } from '../utils/tournamentFormat';

type Props = NativeStackScreenProps<RootStackParamList, 'TournamentForm'>;

export default function TournamentFormScreen({ navigation, route }: Props) {
  const { tournamentId } = route.params;
  const isEdit = Boolean(tournamentId);

  const [format, setFormat] = useState<TournamentFormat>('SUPER_8');
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [scoreLimit, setScoreLimit] = useState<4 | 6>(6);
  const [hasTieBreak, setHasTieBreak] = useState(false);
  const [courtCount, setCourtCount] = useState('1');
  const [woWinner, setWoWinner] = useState('6');
  const [woLoser, setWoLoser] = useState('0');
  const [enableForfeit, setEnableForfeit] = useState(false);

  useEffect(() => {
    if (!tournamentId) return;
    api.get<Tournament>(`/tournaments/${tournamentId}`).then(({ data }) => {
      setFormat(data.format ?? 'SUPER_8');
      setName(data.name);
      setDate(data.date);
      setLocation(data.location ?? '');
      setScoreLimit(data.scoreLimit);
      setHasTieBreak(data.hasTieBreak);
      setCourtCount(String(data.courtCount));
      setWoWinner(String(data.walkoverScoreWinner));
      setWoLoser(String(data.walkoverScoreLoser));
      setEnableForfeit(data.enableForfeitChallenge);
    });
  }, [tournamentId]);

  const onSave = async () => {
    const payload = {
      format,
      name: name.trim(),
      date,
      location: location.trim() || undefined,
      scoreLimit,
      hasTieBreak,
      courtCount: parseInt(courtCount, 10) || 1,
      walkoverScoreWinner: parseInt(woWinner, 10),
      walkoverScoreLoser: parseInt(woLoser, 10),
      enableForfeitChallenge: enableForfeit,
      forfeitChallengeMode: enableForfeit ? ('RANDOM' as const) : undefined,
    };

    try {
      if (isEdit) {
        await api.patch(`/tournaments/${tournamentId}`, payload);
        navigation.goBack();
      } else {
        const { data } = await api.post<Tournament>('/tournaments', payload);
        navigation.replace('TournamentDetail', { tournamentId: data.id });
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar o torneio.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Formato</Text>
      <View style={styles.row}>
        {(['SUPER_8', 'SUPER_8_MIXED'] as const).map((f) => (
          <Pressable
            key={f}
            style={[styles.option, format === f && styles.optionActive]}
            onPress={() => setFormat(f)}
          >
            <Text style={[styles.optionText, format === f && styles.optionTextActive]}>
              {FORMAT_LABEL[f]}
            </Text>
          </Pressable>
        ))}
      </View>
      {format === 'SUPER_8_MIXED' && (
        <Text style={styles.hint}>4 homens + 4 mulheres · duplas mistas</Text>
      )}
      <TextInput style={styles.input} placeholder="Nome do torneio" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Data (AAAA-MM-DD)" value={date} onChangeText={setDate} />
      <TextInput style={styles.input} placeholder="Local" value={location} onChangeText={setLocation} />
      <Text style={styles.label}>Games por set</Text>
      <View style={styles.row}>
        <Pressable
          style={[styles.option, scoreLimit === 4 && styles.optionActive]}
          onPress={() => setScoreLimit(4)}
        >
          <Text style={styles.optionText}>4 games</Text>
        </Pressable>
        <Pressable
          style={[styles.option, scoreLimit === 6 && styles.optionActive]}
          onPress={() => setScoreLimit(6)}
        >
          <Text style={styles.optionText}>6 games</Text>
        </Pressable>
      </View>
      <View style={styles.switchRow}>
        <Text>Tie-break</Text>
        <Switch value={hasTieBreak} onValueChange={setHasTieBreak} />
      </View>
      <TextInput style={styles.input} placeholder="Quadras (1-4)" keyboardType="number-pad" value={courtCount} onChangeText={setCourtCount} />
      <Text style={styles.label}>Placar W.O. (vencedor x perdedor)</Text>
      <View style={styles.row}>
        <TextInput style={[styles.input, styles.half]} keyboardType="number-pad" value={woWinner} onChangeText={setWoWinner} />
        <TextInput style={[styles.input, styles.half]} keyboardType="number-pad" value={woLoser} onChangeText={setWoLoser} />
      </View>
      <View style={styles.switchRow}>
        <Text>Troféu Frango (prenda do último)</Text>
        <Switch value={enableForfeit} onValueChange={setEnableForfeit} />
      </View>
      <Pressable style={styles.button} onPress={onSave}>
        <Text style={styles.buttonText}>Salvar</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f0fdfa' },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#99f6e4' },
  half: { flex: 1 },
  label: { fontWeight: '600', color: '#134e4a', marginBottom: 8 },
  row: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  option: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#e2e8f0', alignItems: 'center' },
  optionActive: { backgroundColor: '#0d9488' },
  optionText: { color: '#134e4a', fontWeight: '500' },
  optionTextActive: { color: '#fff' },
  hint: { color: '#64748b', fontSize: 13, marginBottom: 12, marginTop: -4 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 12 },
  button: { backgroundColor: '#0d9488', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  buttonText: { color: '#fff', fontWeight: '600' },
});
