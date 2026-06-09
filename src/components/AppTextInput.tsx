import { TextInput, TextInputProps } from 'react-native';
import { colors } from '../theme/colors';

export default function AppTextInput({ style, placeholderTextColor, ...props }: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={placeholderTextColor ?? colors.inputPlaceholder}
      style={[{ color: colors.inputText }, style]}
      {...props}
    />
  );
}
