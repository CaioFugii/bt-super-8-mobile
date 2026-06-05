import { forwardRef } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import type { GenderHighlights, SocialCardData } from '../types';

type Props = {
  data: SocialCardData;
  format: 'FEED' | 'STORY';
};

const FEED = { width: 1080, height: 1080 };
const STORY = { width: 1080, height: 1920 };

function MaleHighlights({
  highlights,
  compact,
}: {
  highlights: GenderHighlights;
  compact: boolean;
}) {
  const lineStyle = compact ? styles.highlightLineCompact : styles.highlightLine;
  const labelStyle = compact ? styles.highlightLabelCompact : styles.highlightLabel;
  return (
    <View style={styles.highlightBlock}>
      <Text style={labelStyle}>👨 Melhor Homem</Text>
      <Text style={lineStyle}>{highlights.best.participantName}</Text>
      <Text style={labelStyle}>🥈 Vice-Homem</Text>
      <Text style={lineStyle}>{highlights.runnerUp.participantName}</Text>
      <Text style={labelStyle}>🐔 Frango Homem</Text>
      <Text style={lineStyle}>{highlights.last.participantName}</Text>
    </View>
  );
}

function FemaleHighlights({
  highlights,
  compact,
}: {
  highlights: GenderHighlights;
  compact: boolean;
}) {
  const lineStyle = compact ? styles.highlightLineCompact : styles.highlightLine;
  const labelStyle = compact ? styles.highlightLabelCompact : styles.highlightLabel;
  return (
    <View style={styles.highlightBlock}>
      <Text style={labelStyle}>👩 Melhor Mulher</Text>
      <Text style={lineStyle}>{highlights.best.participantName}</Text>
      <Text style={labelStyle}>🥈 Vice-Mulher</Text>
      <Text style={lineStyle}>{highlights.runnerUp.participantName}</Text>
      <Text style={labelStyle}>🐔 Frango Mulher</Text>
      <Text style={lineStyle}>{highlights.last.participantName}</Text>
    </View>
  );
}

const SocialCardView = forwardRef<View, Props>(({ data, format }, ref) => {
  const size = format === 'FEED' ? FEED : STORY;
  const isMixed =
    data.tournament.format === 'SUPER_8_MIXED' && data.highlights != null;
  const compact = format === 'FEED';
  const top3 = data.ranking.filter((r) => r.position <= 3);
  const rest = data.ranking.filter((r) => r.position > 3);

  return (
    <View ref={ref} style={[styles.card, { width: size.width, height: size.height }]}>
      <Text style={compact ? styles.brandCompact : styles.brand}>
        {isMixed ? 'SUPER 8 MISTO BEACH TENNIS' : 'SUPER 8 BEACH TENNIS'}
      </Text>
      <Text style={compact ? styles.tournamentNameCompact : styles.tournamentName}>
        {data.tournament.name}
      </Text>

      {data.tournament.logoUrl ? (
        <Image
          source={{ uri: data.tournament.logoUrl }}
          style={compact ? styles.logoCompact : styles.logo}
        />
      ) : (
        <Text style={compact ? styles.organizerFallbackCompact : styles.organizerFallback}>
          {data.organizer.name}
        </Text>
      )}

      {isMixed ? (
        <>
          <MaleHighlights highlights={data.highlights!.male} compact={compact} />
          <FemaleHighlights highlights={data.highlights!.female} compact={compact} />
          <Text style={compact ? styles.sectionCompact : styles.section}>
            Ranking Geral
          </Text>
          {data.ranking.map((r) => (
            <Text
              key={r.participantId}
              style={compact ? styles.rankLineCompact : styles.rankLine}
            >
              {r.position}º {r.participantName}
            </Text>
          ))}
        </>
      ) : (
        <>
          {top3.map((r) => (
            <Text key={r.participantId} style={compact ? styles.podiumCompact : styles.podium}>
              {r.position === 1 ? '🥇' : r.position === 2 ? '🥈' : '🥉'} {r.position}º{' '}
              {r.participantName}
              {format === 'FEED'
                ? ` — ${r.wins}V / ${r.gamesBalance >= 0 ? '+' : ''}${r.gamesBalance}`
                : ''}
            </Text>
          ))}
          <Text style={compact ? styles.sectionCompact : styles.section}>Ranking Final</Text>
          {rest.map((r) => (
            <Text
              key={r.participantId}
              style={compact ? styles.rankLineCompact : styles.rankLine}
            >
              {r.position}º {r.participantName}
            </Text>
          ))}
        </>
      )}

      <Text style={compact ? styles.footerCompact : styles.footer}>
        {data.tournament.date}
        {data.tournament.location ? ` · ${data.tournament.location}` : ''}
      </Text>
      {data.organizer.instagramHandle && (
        <Text style={compact ? styles.handleCompact : styles.handle}>
          @{data.organizer.instagramHandle.replace(/^@/, '')}
        </Text>
      )}
    </View>
  );
});

SocialCardView.displayName = 'SocialCardView';

export default SocialCardView;

const styles = StyleSheet.create({
  card: { backgroundColor: '#0f766e', padding: 48, justifyContent: 'center' },
  brand: { color: '#99f6e4', fontSize: 28, fontWeight: '700', textAlign: 'center' },
  brandCompact: { color: '#99f6e4', fontSize: 22, fontWeight: '700', textAlign: 'center' },
  tournamentName: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '800',
    textAlign: 'center',
    marginVertical: 24,
  },
  tournamentNameCompact: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '800',
    textAlign: 'center',
    marginVertical: 16,
  },
  logo: { width: 120, height: 120, alignSelf: 'center', marginBottom: 24, borderRadius: 60 },
  logoCompact: { width: 80, height: 80, alignSelf: 'center', marginBottom: 12, borderRadius: 40 },
  organizerFallback: { color: '#ccfbf1', textAlign: 'center', fontSize: 24, marginBottom: 24 },
  organizerFallbackCompact: {
    color: '#ccfbf1',
    textAlign: 'center',
    fontSize: 18,
    marginBottom: 12,
  },
  podium: { color: '#fff', fontSize: 32, marginVertical: 8, textAlign: 'center' },
  podiumCompact: { color: '#fff', fontSize: 24, marginVertical: 4, textAlign: 'center' },
  highlightBlock: { marginVertical: 8 },
  highlightLabel: { color: '#99f6e4', fontSize: 22, fontWeight: '700', textAlign: 'center', marginTop: 8 },
  highlightLabelCompact: { color: '#99f6e4', fontSize: 16, fontWeight: '700', textAlign: 'center', marginTop: 4 },
  highlightLine: { color: '#fff', fontSize: 28, textAlign: 'center', marginVertical: 4 },
  highlightLineCompact: { color: '#fff', fontSize: 20, textAlign: 'center', marginVertical: 2 },
  section: { color: '#99f6e4', fontSize: 28, marginTop: 32, marginBottom: 12, textAlign: 'center' },
  sectionCompact: { color: '#99f6e4', fontSize: 20, marginTop: 16, marginBottom: 8, textAlign: 'center' },
  rankLine: { color: '#ecfdf5', fontSize: 24, textAlign: 'center', marginVertical: 4 },
  rankLineCompact: { color: '#ecfdf5', fontSize: 18, textAlign: 'center', marginVertical: 2 },
  footer: { color: '#ccfbf1', fontSize: 22, textAlign: 'center', marginTop: 32 },
  footerCompact: { color: '#ccfbf1', fontSize: 16, textAlign: 'center', marginTop: 16 },
  handle: { color: '#5eead4', fontSize: 22, textAlign: 'center', marginTop: 8 },
  handleCompact: { color: '#5eead4', fontSize: 16, textAlign: 'center', marginTop: 4 },
});
