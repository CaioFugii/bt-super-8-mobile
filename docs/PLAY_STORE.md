# Publicar o BTS8 na Google Play Store

Guia passo a passo para gerar o build de produção e disponibilizar o app **BTS8 — Super 8 Beach Tennis** na Play Store.

O app mobile usa **Expo SDK 56** com **EAS Build** e **EAS Submit**.

---

## Visão geral do fluxo

```text
1. Conta Google Play Developer
2. Conta Expo + EAS CLI
3. Variáveis de ambiente de produção
4. eas init (vincular projeto Expo)
5. eas build (gerar .aab)
6. Criar app no Play Console
7. Primeiro upload manual do .aab
8. Service Account (submissões automáticas)
9. Preencher ficha da loja
10. Enviar para revisão → publicar
```

---

## Pré-requisitos

| Item | Detalhe |
|------|---------|
| Conta Google Play Developer | [play.google.com/console](https://play.google.com/console) — taxa única de ~US$ 25 |
| Conta Expo | [expo.dev/signup](https://expo.dev/signup) — plano gratuito cobre builds limitados |
| Node.js 22+ | Mesmo requisito do monorepo |
| API em produção | O app consome `EXPO_PUBLIC_API_URL` (ex.: Heroku). A API precisa estar no ar antes do build de produção |
| Ícones e splash | Já configurados em `mobile/assets/` e `app.json` |

---

## 1. Configuração do projeto (já feita)

O repositório já inclui:

- **`app.json`** — nome `BTS8`, package Android `com.bts8.app`, `versionCode`, ícone adaptativo e splash
- **`eas.json`** — perfis `preview` (APK interno) e `production` (AAB para a loja)
- **Scripts npm** — `build:android:production`, `submit:android`

Identificadores do app (altere apenas se já tiver outro app publicado com o mesmo package):

| Campo | Valor |
|-------|-------|
| Nome na loja / dispositivo | BTS8 |
| Slug Expo | `bts8` |
| Package Android | `com.bts8.app` |
| Versão inicial | `1.0.0` (versionCode `1`) |

---

## 2. Instalar e autenticar o EAS CLI

```bash
npm install -g eas-cli
eas login
```

Na pasta `mobile/`:

```bash
cd mobile
npm install
```

---

## 3. Vincular o projeto ao Expo (`eas init`)

Execute uma vez para criar o projeto no Expo e gravar o `projectId` no `app.json`:

```bash
cd mobile
eas init
```

- Escolha criar um novo projeto ou vincular a um existente
- Confirme o slug `bts8`

---

## 4. Configurar a URL da API de produção

A variável `EXPO_PUBLIC_API_URL` é embutida no build. Para produção, defina no EAS (recomendado):

```bash
cd mobile
eas env:create --name EXPO_PUBLIC_API_URL --value "https://SUA-API.herokuapp.com/api" --environment production --visibility plaintext
```

Substitua pela URL real da API (com `/api` no final).

Para builds locais de teste, use `mobile/.env`:

```bash
cp .env.example .env
# edite EXPO_PUBLIC_API_URL
```

---

## 5. Gerar build de produção (Android App Bundle)

A Play Store exige **AAB** (Android App Bundle), não APK.

```bash
cd mobile
npm run build:android:production
```

Ou com submissão automática após o build (após configurar a Service Account — seção 8):

```bash
eas build --platform android --profile production --auto-submit
```

O build roda na nuvem da Expo. Ao terminar, baixe o `.aab` pelo link exibido no terminal ou em [expo.dev](https://expo.dev) → seu projeto → Builds.

### Build de preview (opcional)

Para testar em dispositivos sem a loja, gere um APK:

```bash
npm run build:android:preview
```

Instale o APK no celular e valide login, torneios e compartilhamento antes do build de produção.

---

## 6. Criar o app no Google Play Console

1. Acesse [Google Play Console](https://play.google.com/console)
2. **Criar app**
3. Preencha nome (**BTS8**), idioma padrão (Português — Brasil), tipo (App), gratuito/pago
4. Aceite as políticas do programa

O **package name** deve ser exatamente `com.bts8.app` (o mesmo de `app.json`). Não é possível alterá-lo depois.

---

## 7. Primeira submissão manual (obrigatória)

A API do Google exige que o **primeiro upload** seja feito manualmente pelo Play Console.

1. No Play Console: **Testar e publicar** → **Teste interno** (ou Produção, se preferir)
2. **Criar nova versão**
3. Faça upload do `.aab` gerado pelo EAS
4. Adicione notas da versão (ex.: "Versão inicial — organização de torneios Super 8")
5. Salve (não é necessário publicar para testadores ainda se ainda faltar a ficha da loja)

---

## 8. Service Account para submissões automáticas (EAS Submit)

Após o primeiro upload manual, configure submissões via CLI:

### 8.1 Criar Service Account no Google Cloud

Siga o guia oficial da Expo:  
[Upload a Google Service Account Key for Play Store submissions](https://docs.expo.dev/submit/android/#creating-a-google-service-account)

Resumo:

1. Google Cloud Console → criar Service Account
2. Conceder acesso no Play Console: **Usuários e permissões** → convidar a service account com permissão **Gerenciar versões de produção** (ou teste interno)
3. Baixar a chave JSON

### 8.2 Salvar a chave no projeto (local, não commitar)

```bash
# Coloque o arquivo em:
mobile/google-service-account.json
```

O arquivo já está no `.gitignore`.

Alternativa: enviar a chave no [EAS Dashboard](https://expo.dev) → Credentials → Android → Service Credentials.

### 8.3 Submeter via CLI

```bash
cd mobile
npm run submit:android
```

Selecione o build de produção mais recente. O `eas.json` está configurado para a faixa **internal** (teste interno). Para produção aberta, altere em `eas.json`:

```json
"submit": {
  "production": {
    "android": {
      "track": "production"
    }
  }
}
```

Faixas disponíveis: `internal`, `alpha`, `beta`, `production`.

---

## 9. Ficha da loja (obrigatório antes de publicar)

No Play Console, complete:

### Conteúdo do app

| Campo | Sugestão |
|-------|----------|
| Título | BTS8 — Super 8 Beach Tennis |
| Descrição curta | Organize torneios Super 8 de Beach Tennis com placares e ranking em tempo real. |
| Descrição completa | Detalhe criação de torneios, participantes, partidas, placares, W.O., card para redes sociais e link para espectadores. |
| Ícone | 512×512 PNG — use `mobile/assets/icon.png` redimensionado se necessário |
| Feature graphic | 1024×500 PNG (banner da loja) |
| Screenshots | Mínimo 2 capturas de tela do app (telefone) |

### Política e conformidade

| Item | Ação |
|------|------|
| Política de privacidade | URL pública obrigatória (pode ser uma página simples no site ou no admin-web) |
| Classificação de conteúdo | Preencher questionário no Play Console |
| Público-alvo | Definir faixa etária |
| Coleta de dados | Declarar se o app coleta e-mail, fotos, etc. (login e upload de logo) |
| App access | Se o app exige login, informar credenciais de teste para o revisor do Google |

### Categoria

Sugestão: **Esportes**.

---

## 10. Teste interno → produção

Ordem recomendada:

1. **Teste interno** — equipe valida o AAB
2. **Teste fechado/aberto** (opcional) — beta com organizadores
3. **Produção** — disponível para todos

Em cada faixa: criar versão → selecionar o AAB → notas da versão → **Revisar versão** → **Iniciar implantação**.

A revisão do Google costuma levar de algumas horas a alguns dias na primeira publicação.

---

## 11. Atualizações futuras

1. Incremente a versão em `app.json`:

   ```json
   "version": "1.0.1"
   ```

   O `eas.json` usa `"autoIncrement": true` para o `versionCode` Android nos builds de produção.

2. Gere novo build:

   ```bash
   npm run build:android:production
   ```

3. Submeta:

   ```bash
   npm run submit:android
   ```

   Ou faça upload manual de um novo AAB no Play Console.

---

## Checklist rápido

- [ ] Conta Google Play Developer ativa
- [ ] `eas login` e `eas init` executados
- [ ] `EXPO_PUBLIC_API_URL` de produção configurada no EAS
- [ ] Build de produção (.aab) gerado com sucesso
- [ ] App criado no Play Console com package `com.bts8.app`
- [ ] Primeiro AAB enviado manualmente
- [ ] Service Account configurada (para `eas submit`)
- [ ] Ícone, screenshots e descrições preenchidos
- [ ] Política de privacidade publicada
- [ ] Classificação de conteúdo concluída
- [ ] Credenciais de teste fornecidas (app com login)
- [ ] Versão enviada para revisão

---

## Referências

- [Expo — Submit to Google Play Store](https://docs.expo.dev/submit/android/)
- [Expo — Build for Android](https://docs.expo.dev/build/setup/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer/)
- [EAS JSON reference](https://docs.expo.dev/eas/json/)
