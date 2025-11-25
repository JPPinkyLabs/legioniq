<!-- d425670d-67a1-4b1a-bc54-6be8af2318d2 c705dcae-f214-4f14-9ec3-d75d45f46abc -->
# Implementação de Upload de Foto de Perfil

## Objetivo

Implementar funcionalidade completa de upload, visualização e remoção de foto de perfil na página de account, com integração ao Supabase Storage e atualização automática do perfil do usuário.

## Estrutura de Dados

### 1. Migration do Banco de Dados

- **Arquivo**: `supabase/migrations/[timestamp]_add_avatar_url_to_profiles.sql`
- Adicionar coluna `avatar_url TEXT` na tabela `profiles`
- Campo nullable para permitir usuários sem foto

### 2. Storage Bucket

- **Bucket**: `avatars` (privado)
- **Limites**:
- Tamanho máximo: 2MB por arquivo
- Tipos MIME permitidos: `image/png`, `image/jpeg`, `image/jpg`, `image/webp`
- Estrutura de path: `{user_id}/avatar.{ext}`
- **RLS Policies**:
- Usuários podem fazer upload apenas para seu próprio diretório
- Usuários podem visualizar apenas seus próprios avatares
- Usuários podem deletar apenas seus próprios avatares

## Componentes e Hooks

### 3. Hook de Upload de Avatar

- **Arquivo**: `src/hooks/useAvatarUpload.ts`
- Funcionalidades:
- `uploadAvatar(base64Image: string)`: Upload da imagem cropped para o storage
- `deleteAvatar()`: Remove a imagem do storage e atualiza o profile
- Validação de tamanho e tipo de arquivo
- Gerenciamento de loading e error states
- Atualização automática do profile após upload/delete

### 4. Hook de Avatar URL

- **Arquivo**: `src/hooks/useAvatarUrl.ts`
- Funcionalidades:
- Buscar avatar_url do profile
- Gerar signed URL para bucket privado
- Cache e invalidação quando necessário

### 5. Componente Avatar com Hover

- **Arquivo**: `src/pages/platform/account/components/AvatarWithActions.tsx`
- Funcionalidades:
- Avatar com hover mostrando ícone de câmera
- ResponsiveDropdown com opções:
- "View Photo" (se tiver foto) - abre modal de visualização
- "Change Photo" ou "Upload Photo" (baseado em ter foto ou não)
- "Delete Photo" (apenas se tiver foto)
- Integração com hooks de upload

### 6. Modal de Crop de Imagem

- **Arquivo**: `src/pages/platform/account/components/AvatarCropModal.tsx`
- Funcionalidades:
- Modal responsivo usando ResponsiveModal
- Integração com ImageCrop do shadcn
- Configuração: `aspect={1}`, `circularCrop={true}`, `maxImageSize={2MB}`
- Botões: Apply, Reset, Cancel
- Após aplicar crop, fazer upload automaticamente
- Feedback visual durante upload

### 7. Modal de Visualização de Foto

- **Arquivo**: `src/pages/platform/account/components/AvatarViewModal.tsx`
- Funcionalidades:
- Modal responsivo usando ResponsiveModal
- Exibir foto em tamanho grande
- Botão de fechar
- Layout centralizado e responsivo

## Integrações

### 8. Atualização da Página Account

- **Arquivo**: `src/pages/platform/account/Account.tsx`
- Substituir Avatar atual por `AvatarWithActions`
- Usar `useUserProfile` para obter avatar_url
- Passar avatar_url para o componente

### 9. Atualização do AuthStore

- **Arquivo**: `src/stores/authStore.ts`
- No `initialize()` e `signIn()`, após obter session, buscar profile completo incluindo avatar_url
- Armazenar avatar_url no estado se necessário (ou usar useUserProfile hook)

### 10. Atualização de Componentes que Usam Avatar

- **Arquivos**:
- `src/components/navigation/NavUser.tsx`
- `src/pages/landing/components/Header.tsx`
- Usar `useUserProfile` para obter avatar_url
- Usar `useAvatarUrl` para obter signed URL quando necessário
- Fallback para iniciais quando não houver foto

## Fluxo de Upload

1. Usuário clica no avatar (hover mostra ícone de câmera)
2. Dropdown abre com opções
3. Usuário seleciona "Upload Photo" ou "Change Photo"
4. Seletor de arquivo nativo abre
5. Após seleção, `AvatarCropModal` abre com a imagem
6. Usuário ajusta o crop (circular, 1:1)
7. Usuário clica em "Apply"
8. Imagem é convertida para base64 e enviada para `useAvatarUpload`
9. Hook faz upload para Supabase Storage (`avatars/{user_id}/avatar.{ext}`)
10. Após upload bem-sucedido, atualiza `profiles.avatar_url` com a URL pública
11. Modal fecha e avatar é atualizado automaticamente via React Query

## Validações e Limites

- **Tamanho máximo**: 2MB (antes do crop)
- **Tipos permitidos**: PNG, JPEG, JPG, WEBP
- **Dimensões**: Crop circular 1:1, tamanho final otimizado pelo ImageCrop
- **Storage**: Bucket privado com RLS
- **URLs**: Signed URLs com expiração de 1 hora para visualização

## Arquivos a Criar/Modificar

### Novos Arquivos:

1. `supabase/migrations/[timestamp]_add_avatar_url_to_profiles.sql`
2. `supabase/migrations/[timestamp]_create_avatars_bucket.sql`
3. `src/hooks/useAvatarUpload.ts`
4. `src/hooks/useAvatarUrl.ts`
5. `src/pages/platform/account/components/AvatarWithActions.tsx`
6. `src/pages/platform/account/components/AvatarCropModal.tsx`
7. `src/pages/platform/account/components/AvatarViewModal.tsx`

### Arquivos a Modificar:

1. `src/pages/platform/account/Account.tsx`
2. `src/components/navigation/NavUser.tsx`
3. `src/pages/landing/components/Header.tsx`
4. `src/hooks/useUserProfile.ts` (se necessário para incluir avatar_url)

## Considerações Técnicas

- Usar TanStack Query para cache e invalidação automática
- Usar signed URLs para bucket privado
- Implementar loading states em todos os componentes
- Tratamento de erros com toast notifications
- Responsividade completa (mobile e desktop)
- Acessibilidade (ARIA labels, keyboard navigation)

### To-dos

- [ ] Criar migration para adicionar coluna avatar_url na tabela profiles
- [ ] Criar migration para criar bucket avatars no Supabase Storage com RLS policies
- [ ] Criar hook useAvatarUpload para upload e delete de avatar no storage
- [ ] Criar hook useAvatarUrl para obter signed URL do avatar
- [ ] Criar componente AvatarWithActions com hover e dropdown de opções
- [ ] Criar modal AvatarCropModal integrando ImageCrop do shadcn
- [ ] Criar modal AvatarViewModal para visualizar foto em tamanho grande
- [ ] Atualizar página Account.tsx para usar AvatarWithActions
- [ ] Atualizar NavUser.tsx para usar avatar_url do profile
- [ ] Atualizar Header.tsx para usar avatar_url do profile