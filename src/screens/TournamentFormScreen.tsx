import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../api/client';
import AppTextInput from '../components/AppTextInput';
import { RootStackParamList } from '../navigation/AppNavigator';
import type { Tournament, TournamentFormat } from '../types';
import { extractApiErrorMessage } from '../utils/apiError';
import { formatDate, formatDateInput, parseDisplayDate } from '../utils/formatDate';
import { showError, showSuccess } from '../utils/feedback';
import { FORMAT_LABEL } from '../utils/tournamentFormat';

type Props = NativeStackScreenProps<RootStackParamList, 'TournamentForm'>;

export default function TournamentFormScreen({ navigation, route }: Props) {
  const { tournamentId } = route.params;
  const isEdit = Boolean(tournamentId);
  const insets = useSafeAreaInsets();

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
  const [nameError, setNameError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [courtCountError, setCourtCountError] = useState<string | null>(null);
  const [woWinnerError, setWoWinnerError] = useState<string | null>(null);
  const [woLoserError, setWoLoserError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!tournamentId) return;
    api.get<Tournament>(`/tournaments/${tournamentId}`).then(({ data }) => {
      setFormat(data.format ?? 'SUPER_8');
      setName(data.name);
      setDate(formatDate(data.date));
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
    const normalizedName = name.trim();
    if (!normalizedName) {
      setNameError('Informe o nome do torneio.');
      return;
    }
    if (normalizedName.length < 3) {
      setNameError('O nome do torneio deve ter pelo menos 3 caracteres.');
      return;
    }
    setNameError(null);

    const apiDate = parseDisplayDate(date);
    if (!apiDate) {
      setDateError('Informe uma data válida no formato DD/MM/AAAA.');
      return;
    }
    setDateError(null);

    const parsedCourtCount = Number(courtCount.trim());
    if (
      !Number.isInteger(parsedCourtCount) ||
      parsedCourtCount < 1 ||
      parsedCourtCount > 10
    ) {
      setCourtCountError('Quantidade de quadras deve ser entre 1 e 10.');
      return;
    }
    setCourtCountError(null);

    const parsedWoWinner = Number(woWinner.trim());
    if (!Number.isInteger(parsedWoWinner) || parsedWoWinner < 0) {
      setWoWinnerError('Informe um valor inteiro maior ou igual a 0.');
      return;
    }
    setWoWinnerError(null);

    const parsedWoLoser = Number(woLoser.trim());
    if (!Number.isInteger(parsedWoLoser) || parsedWoLoser < 0) {
      setWoLoserError('Informe um valor inteiro maior ou igual a 0.');
      return;
    }
    setWoLoserError(null);

    const payload = {
      format,
      name: normalizedName,
      date: apiDate,
      location: location.trim() || undefined,
      scoreLimit,
      hasTieBreak,
      courtCount: parsedCourtCount,
      walkoverScoreWinner: parsedWoWinner,
      walkoverScoreLoser: parsedWoLoser,
      enableForfeitChallenge: enableForfeit,
      forfeitChallengeMode: enableForfeit ? ('RANDOM' as const) : undefined,
    };

    setSaving(true);
    try {
      if (isEdit) {
        await api.patch(`/tournaments/${tournamentId}`, payload);
        showSuccess('Torneio atualizado com sucesso.');
        navigation.goBack();
      } else {
        const { data } = await api.post<Tournament>('/tournaments', payload);
        showSuccess('Torneio criado com sucesso.');
        navigation.replace('TournamentDetail', { tournamentId: data.id });
      }
    } catch (e) {
      const message = extractApiErrorMessage(e);
      if (message.includes('nome do torneio')) {
        setNameError(message);
      } else if (message.includes('data')) {
        setDateError(message);
      } else if (message.includes('quadras')) {
        setCourtCountError(message);
      } else if (message.includes('vencedor')) {
        setWoWinnerError(message);
      } else if (message.includes('perdedor')) {
        setWoLoserError(message);
      } else {
        showError(message);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { paddingBottom: Math.max(16, insets.bottom + 8) },
      ]}
    >
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
      <AppTextInput
        style={[styles.input, nameError && styles.inputError]}
        placeholder="Nome do torneio"
        value={name}
        onChangeText={(value) => {
          setName(value);
          if (nameError) setNameError(null);
        }}
      />
      {nameError && <Text style={styles.fieldError}>{nameError}</Text>}
      <AppTextInput
        style={[styles.input, dateError && styles.inputError]}
        placeholder="Data (DD/MM/AAAA)"
        value={date}
        onChangeText={(value) => {
          setDate(formatDateInput(value));
          if (dateError) setDateError(null);
        }}
        keyboardType="number-pad"
        maxLength={10}
      />
      {dateError && <Text style={styles.fieldError}>{dateError}</Text>}
      <AppTextInput style={styles.input} placeholder="Local" value={location} onChangeText={setLocation} />
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
        <Switch
          value={hasTieBreak}
          onValueChange={setHasTieBreak}
          trackColor={{ false: '#94a3b8', true: '#14b8a6' }}
          thumbColor={hasTieBreak ? '#0f766e' : '#ffffff'}
          ios_backgroundColor="#94a3b8"
        />
      </View>
      <AppTextInput
        style={[styles.input, courtCountError && styles.inputError]}
        placeholder="Quadras (1-10)"
        keyboardType="number-pad"
        value={courtCount}
        onChangeText={(value) => {
          setCourtCount(value);
          if (courtCountError) setCourtCountError(null);
        }}
      />
      {courtCountError && <Text style={styles.fieldError}>{courtCountError}</Text>}
      <Text style={styles.label}>Placar W.O. (vencedor x perdedor)</Text>
      <View style={styles.row}>
        <AppTextInput
          style={[styles.input, styles.half, woWinnerError && styles.inputError]}
          keyboardType="number-pad"
          value={woWinner}
          onChangeText={(value) => {
            setWoWinner(value);
            if (woWinnerError) setWoWinnerError(null);
          }}
        />
        <AppTextInput
          style={[styles.input, styles.half, woLoserError && styles.inputError]}
          keyboardType="number-pad"
          value={woLoser}
          onChangeText={(value) => {
            setWoLoser(value);
            if (woLoserError) setWoLoserError(null);
          }}
        />
      </View>
      {(woWinnerError || woLoserError) && (
        <Text style={styles.fieldError}>{woWinnerError ?? woLoserError}</Text>
      )}
      <View style={styles.switchRow}>
        <Text>Troféu Frango (prenda do último)</Text>
        <Switch
          value={enableForfeit}
          onValueChange={setEnableForfeit}
          trackColor={{ false: '#94a3b8', true: '#14b8a6' }}
          thumbColor={enableForfeit ? '#0f766e' : '#ffffff'}
          ios_backgroundColor="#94a3b8"
        />
      </View>
      <Pressable style={[styles.button, saving && styles.buttonDisabled]} onPress={onSave} disabled={saving}>
        <Text style={styles.buttonText}>{saving ? 'Salvando...' : 'Salvar'}</Text>
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
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: '600' },
  inputError: { borderColor: '#dc2626' },
  fieldError: { color: '#dc2626', marginTop: -6, marginBottom: 10 },
});
