import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import AppTextInput from '../components/AppTextInput';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuthStore } from '../store/authStore';
import { extractApiErrorMessage } from '../utils/apiError';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const register = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [instagram, setInstagram] = useState('');

  const onSubmit = async () => {
    try {
      await register(
        name.trim(),
        email.trim(),
        password,
        instagram.trim() || undefined,
      );
    } catch (e) {
      Alert.alert('Erro', extractApiErrorMessage(e));
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AppTextInput style={styles.input} placeholder="Nome" value={name} onChangeText={setName} />
      <AppTextInput
        style={styles.input}
        placeholder="E-mail"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <AppTextInput
        style={styles.input}
        placeholder="Senha (mín. 6)"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
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
  button: { backgroundColor: '#0d9488', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: '600' },
  link: { color: '#0f766e', textAlign: 'center', marginTop: 20 },
});
