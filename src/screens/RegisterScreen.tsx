import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppTextInput from '../components/AppTextInput';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuthStore } from '../store/authStore';
import { extractApiErrorMessage } from '../utils/apiError';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const register = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [instagram, setInstagram] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const onSubmit = async () => {
    const normalizedName = name.trim();
    const normalizedEmail = email.trim();
    const normalizedInstagram = instagram.trim();
    let hasError = false;

    if (!normalizedName) {
      setNameError('Informe seu nome.');
      hasError = true;
    } else if (normalizedName.length < 2) {
      setNameError('O nome deve ter pelo menos 2 caracteres.');
      hasError = true;
    } else {
      setNameError(null);
    }

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
      setPasswordError('Informe uma senha.');
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError('A senha deve ter pelo menos 6 caracteres.');
      hasError = true;
    } else {
      setPasswordError(null);
    }

    if (hasError) return;

    try {
      await register(
        normalizedName,
        normalizedEmail,
        password,
        normalizedInstagram || undefined,
      );
    } catch (e) {
      Alert.alert('Erro', extractApiErrorMessage(e));
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { paddingBottom: Math.max(24, insets.bottom + 12) },
      ]}
    >
      <AppTextInput
        style={[styles.input, nameError && styles.inputError]}
        placeholder="Nome"
        value={name}
        onChangeText={(value) => {
          setName(value);
          if (nameError) setNameError(null);
        }}
      />
      {nameError && <Text style={styles.fieldError}>{nameError}</Text>}
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
        placeholder="Senha (mín. 6)"
        secureTextEntry
        value={password}
        onChangeText={(value) => {
          setPassword(value);
          if (passwordError) setPasswordError(null);
        }}
      />
      {passwordError && <Text style={styles.fieldError}>{passwordError}</Text>}
      <AppTextInput
        style={styles.input}
        placeholder="Instagram (@opcional)"
        autoCapitalize="none"
        value={instagram}
        onChangeText={setInstagram}
      />
      <Pressable
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={onSubmit}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>Cadastrar</Text>
      </Pressable>
      <Pressable onPress={() => navigation.goBack()}>
        <Text style={styles.link}>Já tenho conta</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#f0fdfa', flexGrow: 1 },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#99f6e4' },
  inputError: { borderColor: '#dc2626' },
  fieldError: { color: '#dc2626', marginTop: -8, marginBottom: 10 },
  button: { backgroundColor: '#0d9488', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: '600' },
  link: { color: '#0f766e', textAlign: 'center', marginTop: 20 },
});
