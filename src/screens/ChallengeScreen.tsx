import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { api } from '../api/client';
import { RootStackParamList } from '../navigation/AppNavigator';
import type { ChallengeData } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Challenge'>;

export default function ChallengeScreen({ route }: Props) {
  const { tournamentId } = route.params;
  const [data, setData] = useState<ChallengeData | null>(null);
  const cardRef = useRef<View>(null);

  useEffect(() => {
    api
      .get<ChallengeData>(`/tournaments/${tournamentId}/challenge`)
      .then(({ data: d }) => setData(d))
      .catch(() =>
        Alert.alert('Erro', 'Nenhum desafio sorteado para este torneio.'),
      );
  }, [tournamentId]);

  const share = async () => {
    if (!cardRef.current) return;
    try {
      const uri = await captureRef(cardRef, { format: 'png', quality: 1, width: 1080, height: 1080 });
      const dest = `${FileSystem.cacheDirectory}frango-card.png`;
      await FileSystem.copyAsync({ from: uri, to: dest });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(dest);
      }
    } catch {
      Alert.alert('Erro ao compartilhar');
    }
  };

  if (!data) return <Text style={styles.loading}>Carregando...</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View ref={cardRef} style={styles.card} collapsable={false}>
        <Text style={styles.emoji}>🐔 TROFÉU FRANGO</Text>
        <Text style={styles.name}>{data.participant.name}</Text>
        <Text style={styles.challenge}>{data.challenge}</Text>
      </View>
      <Pressable style={styles.btn} onPress={share}>
        <Text style={styles.btnText}>Compartilhar card</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, alignItems: 'center', backgroundColor: '#f0fdfa' },
  loading: { padding: 24 },
  card: { width: 1080, height: 1080, backgroundColor: '#fbbf24', padding: 48, justifyContent: 'center', transform: [{ scale: 0.35 }] },
  emoji: { fontSize: 48, fontWeight: '800', textAlign: 'center', color: '#78350f' },
  name: { fontSize: 56, fontWeight: '700', textAlign: 'center', marginVertical: 32, color: '#451a03' },
  challenge: { fontSize: 36, textAlign: 'center', color: '#92400e', fontStyle: 'italic' },
  btn: { backgroundColor: '#d97706', padding: 16, borderRadius: 8, marginTop: 24 },
  btnText: { color: '#fff', fontWeight: '600' },
});
