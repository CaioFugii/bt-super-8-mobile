import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import QRCode from 'react-native-qrcode-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../api/client';
import { RootStackParamList } from '../navigation/AppNavigator';
import { extractApiErrorMessage } from '../utils/apiError';
import { confirmAction } from '../utils/confirmAction';
import { formatDateTime } from '../utils/formatDate';
import { showError, showSuccess } from '../utils/feedback';

type Props = NativeStackScreenProps<RootStackParamList, 'ShareTournament'>;

type ShareLinkStatus = {
  active: boolean;
  publicUrl: string | null;
  publicTokenExpiresAt: string | null;
};

type ShareLinkResponse = {
  publicUrl: string;
  publicTokenExpiresAt: string;
};

export default function ShareTournamentScreen({ route }: Props) {
  const { tournamentId } = route.params;
  const insets = useSafeAreaInsets();
  const [status, setStatus] = useState<ShareLinkStatus | null>(null);
  const [showQr, setShowQr] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const { data } = await api.get<ShareLinkStatus>(
      `/tournaments/${tournamentId}/share-link`,
    );
    setStatus(data);
    if (!data.active) setShowQr(false);
  }, [tournamentId]);

  useFocusEffect(
    useCallback(() => {
      load().catch((e) => showError(extractApiErrorMessage(e)));
    }, [load]),
  );

  const generateLink = async () => {
    if (status?.active) {
      const confirmed = await confirmAction({
        title: 'Gerar novo link?',
        message: 'O link anterior deixará de funcionar imediatamente.',
        confirmLabel: 'Gerar novo link',
      });
      if (!confirmed) return;
    }

    setLoading(true);
    try {
      const { data } = await api.post<ShareLinkResponse>(
        `/tournaments/${tournamentId}/share-link`,
      );
      setStatus({
        active: true,
        publicUrl: data.publicUrl,
        publicTokenExpiresAt: data.publicTokenExpiresAt,
      });
      setShowQr(true);
      showSuccess(status?.active ? 'Novo link público gerado.' : 'Link público gerado.');
    } catch (e) {
      showError(extractApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    if (!status?.publicUrl) return;
    await Clipboard.setStringAsync(status.publicUrl);
    showSuccess('Link copiado!');
  };

  const shareLink = async () => {
    if (!status?.publicUrl) return;
    await Share.share({ message: status.publicUrl, url: status.publicUrl });
  };

  const revokeLink = async () => {
    const confirmed = await confirmAction({
      title: 'Revogar link público?',
      message:
        'Competidores que receberam este link não conseguirão mais acessar o torneio por ele.',
      confirmLabel: 'Revogar link',
      destructive: true,
    });
    if (!confirmed || loading) return;

    setLoading(true);
    try {
      await api.delete(`/tournaments/${tournamentId}/share-link`);
      showSuccess('Link público revogado.');
      await load();
    } catch (e) {
      showError(extractApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  if (!status) return null;

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { paddingBottom: Math.max(16, insets.bottom + 8) },
      ]}
    >
      <Text style={styles.title}>Compartilhamento</Text>
      <Text style={styles.subtitle}>
        Link público temporário para competidores visualizarem o torneio no navegador.
      </Text>

      {!status.active ? (
        <>
          <Text style={styles.empty}>Nenhum link público ativo.</Text>
          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={generateLink}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Gerando link...' : 'Compartilhar Torneio'}
            </Text>
          </Pressable>
        </>
      ) : (
        <>
          <View style={styles.card}>
            <Text style={styles.label}>Link ativo até:</Text>
            <Text style={styles.expiry}>
              {status.publicTokenExpiresAt
                ? formatDateTime(status.publicTokenExpiresAt)
                : '—'}
            </Text>
            <Text style={styles.url}>{status.publicUrl}</Text>
          </View>

          <Pressable style={styles.button} onPress={copyLink}>
            <Text style={styles.buttonText}>Copiar Link</Text>
          </Pressable>
          <Pressable style={styles.secondary} onPress={shareLink}>
            <Text style={styles.secondaryText}>Compartilhar</Text>
          </Pressable>
          <Pressable style={styles.secondary} onPress={() => setShowQr((v) => !v)}>
            <Text style={styles.secondaryText}>
              {showQr ? 'Ocultar QR Code' : 'Exibir QR Code'}
            </Text>
          </Pressable>
          {showQr && status.publicUrl && (
            <View style={styles.qrBox}>
              <QRCode value={status.publicUrl} size={220} />
            </View>
          )}
          <Pressable
            style={styles.secondary}
            onPress={generateLink}
            disabled={loading}
          >
            <Text style={styles.secondaryText}>
              {loading ? 'Gerando link...' : 'Gerar Novo Link'}
            </Text>
          </Pressable>
          <Pressable style={styles.danger} onPress={revokeLink}>
            <Text style={styles.dangerText}>Revogar Link</Text>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f0fdfa' },
  title: { fontSize: 20, fontWeight: '700', color: '#134e4a', marginBottom: 8 },
  subtitle: { color: '#64748b', marginBottom: 20, lineHeight: 20 },
  empty: { color: '#134e4a', marginBottom: 16, fontWeight: '500' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#99f6e4',
  },
  label: { color: '#64748b', fontSize: 13 },
  expiry: { fontSize: 18, fontWeight: '700', color: '#134e4a', marginTop: 4 },
  url: { color: '#0d9488', marginTop: 12, fontSize: 13 },
  button: {
    backgroundColor: '#0d9488',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: '600' },
  secondary: {
    borderWidth: 1,
    borderColor: '#0d9488',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  secondaryText: { color: '#0d9488', fontWeight: '600' },
  danger: { padding: 14, alignItems: 'center', marginTop: 8 },
  dangerText: { color: '#dc2626', fontWeight: '600' },
  qrBox: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#99f6e4',
  },
});
