import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { api } from '../api/client';
import SocialCardView from '../components/SocialCardView';
import { RootStackParamList } from '../navigation/AppNavigator';
import type { SocialCardData } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'SocialCard'>;

export default function SocialCardScreen({ route }: Props) {
  const { tournamentId } = route.params;
  const [data, setData] = useState<SocialCardData | null>(null);
  const [format, setFormat] = useState<'FEED' | 'STORY'>('FEED');
  const cardRef = useRef<View>(null);

  useEffect(() => {
    api
      .get<SocialCardData>(`/tournaments/${tournamentId}/social-card-data`)
      .then(({ data: d }) => setData(d))
      .catch(() => Alert.alert('Erro', 'Torneio precisa estar finalizado.'));
  }, [tournamentId]);

  const exportCard = async () => {
    if (!cardRef.current) return;
    try {
      const uri = await captureRef(cardRef, {
        format: 'png',
        quality: 1,
        width: format === 'FEED' ? 1080 : 1080,
        height: format === 'FEED' ? 1080 : 1920,
      });
      const dest = `${FileSystem.cacheDirectory}super8-card-${format}.png`;
      await FileSystem.copyAsync({ from: uri, to: dest });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(dest, { mimeType: 'image/png' });
      } else {
        Alert.alert('Salvo', dest);
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível gerar a imagem.');
    }
  };

  if (!data) return <Text style={styles.loading}>Carregando...</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.toggle}>
        <Pressable
          style={[styles.chip, format === 'FEED' && styles.chipActive]}
          onPress={() => setFormat('FEED')}
        >
          <Text>Feed 1:1</Text>
        </Pressable>
        <Pressable
          style={[styles.chip, format === 'STORY' && styles.chipActive]}
          onPress={() => setFormat('STORY')}
        >
          <Text>Story 9:16</Text>
        </Pressable>
      </View>
      <ScrollView horizontal>
        <View style={styles.previewScale} collapsable={false} ref={cardRef}>
          <SocialCardView data={data} format={format} />
        </View>
      </ScrollView>
      <Pressable style={styles.btn} onPress={exportCard}>
        <Text style={styles.btnText}>Compartilhar / Salvar PNG</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f0fdfa' },
  loading: { padding: 24, textAlign: 'center' },
  toggle: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  chip: { padding: 10, borderRadius: 8, backgroundColor: '#e2e8f0' },
  chipActive: { backgroundColor: '#0d9488' },
  previewScale: { transform: [{ scale: 0.3 }], transformOrigin: 'top left' },
  btn: { backgroundColor: '#0d9488', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  btnText: { color: '#fff', fontWeight: '600' },
});
