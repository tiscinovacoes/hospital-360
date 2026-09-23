import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Extrai a mensagem de um valor capturado em `catch`.
 *
 * Em JS qualquer valor pode ser lançado, não só `Error`. Tipar o catch como
 * `any` e ler `err.message` direto devolve `undefined` quando o que veio foi
 * uma string, um objeto de erro do Supabase ou um `null` — e a mensagem some
 * justamente no caminho de falha. Com `unknown` + este helper o tipo força o
 * tratamento e sempre sobra um texto utilizável.
 */
export function mensagemErro(err: unknown, padrao = 'Erro desconhecido'): string {
  const texto = (() => {
    if (err instanceof Error) return err.message;
    if (typeof err === 'string') return err;
    if (err && typeof err === 'object' && 'message' in err) {
      const { message } = err as { message: unknown };
      if (typeof message === 'string') return message;
    }
    return '';
  })();
  // Mensagem vazia conta como ausente, igual ao `err?.message || padrao`.
  return texto.trim() ? texto : padrao;
}
