import type { AxiosError } from 'axios';

const NETWORK_MESSAGE =
  'Não foi possível conectar ao servidor.\nVerifique sua internet e tente novamente.';

const UNEXPECTED_MESSAGE =
  'Ocorreu um erro inesperado.\nTente novamente em alguns instantes.';

type ApiErrorBody = {
  code?: string;
  message?: string | string[] | { code?: string; message?: string };
  details?: unknown;
};

export function extractApiErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<ApiErrorBody>;
  if (!axiosError.response) {
    return NETWORK_MESSAGE;
  }

  const data = axiosError.response.data;
  if (!data) {
    return UNEXPECTED_MESSAGE;
  }

  if (typeof data.message === 'string') {
    return data.message;
  }

  if (Array.isArray(data.message)) {
    return data.message.join('\n');
  }

  if (
    typeof data.message === 'object' &&
    data.message &&
    typeof data.message.message === 'string'
  ) {
    return data.message.message;
  }

  return UNEXPECTED_MESSAGE;
}
