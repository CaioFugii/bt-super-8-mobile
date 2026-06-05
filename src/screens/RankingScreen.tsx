import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api/client';
import { RootStackParamList } from '../navigation/AppNavigator';
import type { RankingEntry } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Ranking'>;

export default function RankingScreen({ route }: Props) {
  const { tournamentId } = route.params;
  const [ranking, setRanking] = useState<RankingEntry[]>([]);

  const load = useCallback(async () => {
    const { data } = await api.get<{ ranking: RankingEntry[] }>(
      `/tournaments/${tournamentId}/ranking`,
    );
    setRanking(data.ranking);
  }, [tournamentId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <FlatList
      style={styles.container}
      data={ranking}
      keyExtractor={(item) => item.participantId}
      ListHeaderComponent={<Text style={styles.header}>Classificação individual</Text>}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Text style={styles.pos}>{item.position}º</Text>
          <View style={styles.info}>
            <Text style={styles.name}>{item.participantName}</Text>
            <Text style={styles.stats}>
              {item.wins}V · {item.losses}D · saldo {item.gamesBalance > 0 ? '+' : ''}
              {item.gamesBalance}
            </Text>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0fdfa', padding: 16 },
  header: { fontSize: 16, fontWeight: '600', color: '#134e4a', marginBottom: 12 },
  row: { flexDirection: 'row', backgroundColor: '#fff', padding: 14, borderRadius: 8, marginBottom: 8, alignItems: 'center' },
  pos: { fontSize: 20, fontWeight: '700', color: '#0d9488', width: 40 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: '#134e4a' },
  stats: { color: '#64748b', fontSize: 13, marginTop: 2 },
});
