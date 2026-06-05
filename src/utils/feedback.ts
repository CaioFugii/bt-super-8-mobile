import { Alert } from 'react-native';

export function showSuccess(message: string) {
  Alert.alert('Sucesso', message);
}

export function showError(message: string) {
  Alert.alert('Erro', message);
}
