import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api/client';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuthStore } from '../store/authStore';
import type { Tournament, TournamentStatus } from '../types';
import { formatDate } from '../utils/formatDate';
import { FORMAT_LABEL } from '../utils/tournamentFormat';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const STATUS_LABEL: Record<TournamentStatus, string> = {
  DRAFT: 'Rascunho',
  IN_PROGRESS: 'Em andamento',
  FINISHED: 'Finalizado',
  CANCELLED: 'Cancelado',
};

export default function HomeScreen({ navigation }: Props) {
  const logout = useAuthStore((s) => s.logout);
  const organizer = useAuthStore((s) => s.organizer);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [filter, setFilter] = useState<TournamentStatus | undefined>();

  const load = useCallback(async () => {
    const { data } = await api.get<Tournament[]>('/tournaments', {
      params: filter ? { status: filter } : undefined,
    });
    setTournaments(data);
  }, [filter]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Olá, {organizer?.name}</Text>
      <View style={styles.filters}>
        {([undefined, 'DRAFT', 'IN_PROGRESS', 'FINISHED'] as const).map((s) => (
          <Pressable
            key={s ?? 'all'}
            style={[styles.chip, filter === s && styles.chipActive]}
            onPress={() => setFilter(s)}
          >
            <Text style={[styles.chipText, filter === s && styles.chipTextActive]}>
              {s ? STATUS_LABEL[s] : 'Todos'}
            </Text>
          </Pressable>
        ))}
      </View>
      <FlatList
        data={tournaments}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={false} onRefresh={load} />}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum torneio encontrado</Text>}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() =>
              navigation.navigate('TournamentDetail', { tournamentId: item.id })
            }
          >
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardMeta}>
              {FORMAT_LABEL[item.format ?? 'SUPER_8']} · {formatDate(item.date)} ·{' '}
              {STATUS_LABEL[item.status]}
            </Text>
          </Pressable>
        )}
      />
      <Pressable
        style={styles.fab}
        onPress={() => navigation.navigate('TournamentForm', {})}
      >
        <Text style={styles.fabText}>+ Novo torneio</Text>
      </Pressable>
      <Pressable onPress={logout} style={styles.logout}>
        <Text style={styles.logoutText}>Sair</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f0fdfa' },
  greeting: { fontSize: 18, fontWeight: '600', color: '#134e4a', marginBottom: 12 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#ccfbf1' },
  chipActive: { backgroundColor: '#0d9488' },
  chipText: { color: '#0f766e', fontSize: 12 },
  chipTextActive: { color: '#fff' },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#99f6e4' },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#134e4a' },
  cardMeta: { color: '#5eead4', marginTop: 4, fontSize: 13 },
  empty: { textAlign: 'center', color: '#64748b', marginTop: 40 },
  fab: { backgroundColor: '#0d9488', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  fabText: { color: '#fff', fontWeight: '600' },
  logout: { padding: 12, alignItems: 'center' },
  logoutText: { color: '#64748b' },
});
