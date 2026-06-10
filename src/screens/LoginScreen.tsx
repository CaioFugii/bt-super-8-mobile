import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppTextInput from '../components/AppTextInput';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuthStore } from '../store/authStore';
import { extractApiErrorMessage } from '../utils/apiError';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const onSubmit = async () => {
    const normalizedEmail = email.trim();
    let hasError = false;
    if (!normalizedEmail) {
      setEmailError('Informe seu e-mail.');
      hasError = true;
    } else if (!/\S+@\S+\.\S+/.test(normalizedEmail)) {
      setEmailError('Informe um e-mail valido.');
      hasError = true;
    } else {
      setEmailError(null);
    }

    if (!password) {
      setPasswordError('Informe sua senha.');
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError('A senha deve ter pelo menos 6 caracteres.');
      hasError = true;
    } else {
      setPasswordError(null);
    }

    if (hasError) return;

    try {
      await login(normalizedEmail, password);
    } catch (e) {
      Alert.alert('Erro', extractApiErrorMessage(e));
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: Math.max(24, insets.bottom + 12) },
      ]}
    >
      <Text style={styles.title}>Super 8 Beach Tennis</Text>
      <AppTextInput
        style={[styles.input, emailError && styles.inputError]}
        placeholder="E-mail"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={(value) => {
          setEmail(value);
          if (emailError) setEmailError(null);
        }}
      />
      {emailError && <Text style={styles.fieldError}>{emailError}</Text>}
      <AppTextInput
        style={[styles.input, passwordError && styles.inputError]}
        placeholder="Senha"
        secureTextEntry
        value={password}
        onChangeText={(value) => {
          setPassword(value);
          if (passwordError) setPasswordError(null);
        }}
      />
      {passwordError && <Text style={styles.fieldError}>{passwordError}</Text>}
      <Pressable
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={onSubmit}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>{isLoading ? 'Entrando...' : 'Entrar'}</Text>
      </Pressable>
      <Pressable onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Criar conta de organizador</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#f0fdfa' },
  title: { fontSize: 24, fontWeight: '700', color: '#0f766e', marginBottom: 24, textAlign: 'center' },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#99f6e4' },
  inputError: { borderColor: '#dc2626' },
  fieldError: { color: '#dc2626', marginTop: -8, marginBottom: 10 },
  button: { backgroundColor: '#0d9488', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  link: { color: '#0f766e', textAlign: 'center', marginTop: 20 },
});
