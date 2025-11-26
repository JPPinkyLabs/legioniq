<!-- cac8456d-334d-44fa-ae50-0063d14c564e e1ece7b0-bebe-4b31-b32e-c7ca36d2e2a4 -->
# Sistema de Edição de Prompts

## Objetivo

Implementar funcionalidade de edição de prompts para administradores, permitindo editar apenas os campos `category` e `prompt_text`, com validação usando React Hook Form + Zod, e salvando logs de edição através de edge function.

## Estrutura da Implementação

### 1. Estado de Edição na Página PromptDetails

**Arquivo**: `src/pages/platform/admin/prompts/PromptDetails.tsx`

- Adicionar estado `isEditing` para controlar modo de edição/visualização
- Adicionar botão "Edit" no header (ao lado do título) que ativa modo de edição
- Quando em modo de edição, exibir botão "Cancel" no header (ao lado do título)
- Botão "Save" será exibido dentro do componente de edição
- Renderização condicional: se `isEditing` é `true`, renderizar `PromptEditForm`, senão renderizar card de visualização
- Função `handleCancel` para resetar formulário e sair do modo edição

### 2. Componente Separado de Edição

**Arquivo**: `src/components/prompts/PromptEditForm.tsx` (novo)

- Criar componente separado para formulário de edição
- Seguir o mesmo layout do card de visualização:
- Usar `Card`, `CardHeader`, `CardTitle`, `CardContent`
- Mesma estrutura de grid: `grid gap-4 sm:grid-cols-2`
- Campo Category: exibir como `Select` (FormField) - ocupa 1 coluna
- Campo Prompt Text: exibir como `Textarea` (FormField) - ocupa 2 colunas (`sm:col-span-2`)
- Outros campos (ID, Created At, Created By, Last Edited, Last Edited By) permanecem como texto (não editáveis)
- Criar schema Zod para validação:
- `category_id`: UUID obrigatório
- `prompt_text`: string obrigatória, mínimo de caracteres
- Usar `useForm` do React Hook Form com `zodResolver`
- Usar componentes `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage` do shadcn/ui
- Receber props: `prompt` (dados atuais), `categories` (lista de categorias), `onSubmit` (callback), `onCancel` (callback), `isSubmitting` (loading state)
- Inicializar formulário com valores atuais do prompt
- Exibir botão "Save" dentro do CardContent (abaixo dos campos)
- Exibir botão "Cancel" no header (passado como prop ou renderizado no componente pai)

### 3. Hook para Buscar Categorias

**Arquivo**: `src/hooks/other/useCategories.ts` (já existe)

- Usar hook existente `useCategories` para buscar todas as categorias
- Ordenar por `display_order` (já implementado)

### 4. Hook para Atualizar Prompt

**Arquivo**: `src/hooks/prompts/useUpdatePrompt.ts` (novo)

- Criar hook usando `useMutation` do TanStack Query
- Chamar edge function `update-prompt` via `supabase.functions.invoke`
- Passar `prompt_id`, `category_id`, `prompt_text` no body
- Passar `Authorization` header com token da sessão
- Invalidar queries `["prompt", id]` e `["prompts"]` após sucesso
- Retornar `mutateAsync`, `isPending`, `error`

### 5. Edge Function para Atualizar Prompt

**Arquivo**: `supabase/functions/update-prompt/index.ts` (novo)

- Verificar autenticação do usuário
- Verificar se usuário tem role 'admin' (buscar em `profiles`)
- Validar parâmetros: `prompt_id`, `category_id`, `prompt_text`
- Buscar prompt atual para obter dados antigos
- Atualizar prompt na tabela `prompts`:
- Atualizar `category_id`
- Atualizar `prompt_text`
- Criar log na tabela `prompts_logs`:
- `prompt_id`: ID do prompt
- `edited_by`: ID do usuário que editou
- `category_id`: categoria ANTES da edição (do prompt atual)
- `prompt_text`: texto ANTES da edição (do prompt atual)
- `created_at`: timestamp atual
- Retornar resposta de sucesso com dados atualizados

### 6. Atualizar Tipos Compartilhados

**Arquivo**: `supabase/functions/_shared/types.ts`

- Adicionar interface `UpdatePromptRequest`:
- `prompt_id`: string
- `category_id`: string
- `prompt_text`: string
- Adicionar interface `UpdatePromptResponse`:
- `success`: boolean
- `data`?: objeto com prompt atualizado
- `error`?: string

### 7. UI de Edição

**Arquivo**: `src/pages/platform/admin/prompts/PromptDetails.tsx`

- Modo visualização: exibir dados como texto (layout atual)
- Modo edição:
- Campo Category: `Select` com todas as categorias (usar `FormField` com `Select`)
- Campo Prompt Text: `Textarea` (usar `FormField` com `Textarea`)
- Botões: "Save" (submit) e "Cancel" (reset form e sair do modo edição)
- Loading state durante salvamento
- Toast de sucesso/erro após operação
- Resetar formulário ao cancelar

## Arquivos a Criar/Modificar

1. `src/pages/platform/admin/prompts/PromptDetails.tsx` (modificar)
2. `src/hooks/prompts/useUpdatePrompt.ts` (novo)
3. `supabase/functions/update-prompt/index.ts` (novo)
4. `supabase/functions/_shared/types.ts` (modificar)

## Observações Importantes

- Apenas admins podem editar (verificação na edge function)
- Logs salvam o estado ANTES da edição (para histórico)
- Validação no frontend (Zod) e backend (edge function)
- Invalidar queries após atualização para refletir mudanças
- Tratar erros adequadamente com toasts
- Desabilitar campos durante salvamento

### To-dos

- [x] Criar migration para adicionar coluna role na tabela profiles com constraint e valor padrão
- [x] Atualizar AuthStore para incluir role no estado e métodos setRole/clearAuth
- [x] Atualizar edge functions (auth-sign-in, auth-sign-up, auth-session) para buscar e retornar role
- [x] Atualizar tipos TypeScript em _shared/types.ts para incluir role nas responses
- [x] Atualizar métodos signIn, signUp e initialize no AuthStore para carregar e salvar role
- [x] Adicionar badge com role na página Account.tsx ao lado do ícone BadgeCheck
- [x] Adicionar badge com role no AccountTab.tsx ao lado do ícone BadgeCheck
- [x] Criar migration para adicionar coluna role na tabela profiles com constraint e valor padrão
- [x] Atualizar AuthStore para incluir role no estado e métodos setRole/clearAuth
- [x] Atualizar edge functions (auth-sign-in, auth-sign-up, auth-session) para buscar e retornar role
- [x] Atualizar tipos TypeScript em _shared/types.ts para incluir role nas responses
- [x] Atualizar métodos signIn, signUp e initialize no AuthStore para carregar e salvar role
- [x] Adicionar badge com role na página Account.tsx ao lado do ícone BadgeCheck
- [x] Criar migration para adicionar coluna role na tabela profiles com constraint e valor padrão
- [x] Atualizar AuthStore para incluir role no estado e métodos setRole/clearAuth
- [x] Atualizar edge functions (auth-sign-in, auth-sign-up, auth-session) para buscar e retornar role
- [x] Atualizar tipos TypeScript em _shared/types.ts para incluir role nas responses
- [x] Atualizar métodos signIn, signUp e initialize no AuthStore para carregar e salvar role
- [x] Adicionar badge com role na página Account.tsx ao lado do ícone BadgeCheck
- [x] Adicionar badge com role no AccountTab.tsx ao lado do ícone BadgeCheck
- [x] Criar migration para adicionar coluna role na tabela profiles com constraint e valor padrão
- [x] Atualizar AuthStore para incluir role no estado e métodos setRole/clearAuth
- [x] Atualizar edge functions (auth-sign-in, auth-sign-up, auth-session) para buscar e retornar role
- [x] Atualizar tipos TypeScript em _shared/types.ts para incluir role nas responses
- [x] Atualizar métodos signIn, signUp e initialize no AuthStore para carregar e salvar role
- [x] Adicionar badge com role na página Account.tsx ao lado do ícone BadgeCheck
- [x] Criar migration para adicionar coluna role na tabela profiles com constraint e valor padrão
- [x] Atualizar AuthStore para incluir role no estado e métodos setRole/clearAuth
- [x] Atualizar edge functions (auth-sign-in, auth-sign-up, auth-session) para buscar e retornar role
- [x] Atualizar tipos TypeScript em _shared/types.ts para incluir role nas responses
- [x] Atualizar métodos signIn, signUp e initialize no AuthStore para carregar e salvar role
- [x] Adicionar badge com role na página Account.tsx ao lado do ícone BadgeCheck
- [x] Adicionar badge com role no AccountTab.tsx ao lado do ícone BadgeCheck
- [x] Criar migration para adicionar coluna role na tabela profiles com constraint e valor padrão
- [x] Atualizar AuthStore para incluir role no estado e métodos setRole/clearAuth
- [x] Atualizar edge functions (auth-sign-in, auth-sign-up, auth-session) para buscar e retornar role
- [x] Atualizar tipos TypeScript em _shared/types.ts para incluir role nas responses
- [x] Atualizar métodos signIn, signUp e initialize no AuthStore para carregar e salvar role
- [x] Adicionar badge com role na página Account.tsx ao lado do ícone BadgeCheck
- [x] Criar migration para adicionar coluna role na tabela profiles com constraint e valor padrão
- [x] Atualizar AuthStore para incluir role no estado e métodos setRole/clearAuth
- [x] Atualizar edge functions (auth-sign-in, auth-sign-up, auth-session) para buscar e retornar role
- [x] Atualizar tipos TypeScript em _shared/types.ts para incluir role nas responses
- [x] Atualizar métodos signIn, signUp e initialize no AuthStore para carregar e salvar role
- [x] Adicionar badge com role na página Account.tsx ao lado do ícone BadgeCheck
- [x] Adicionar badge com role no AccountTab.tsx ao lado do ícone BadgeCheck
- [x] Criar migration para adicionar coluna role na tabela profiles com constraint e valor padrão
- [x] Atualizar AuthStore para incluir role no estado e métodos setRole/clearAuth
- [x] Atualizar edge functions (auth-sign-in, auth-sign-up, auth-session) para buscar e retornar role
- [x] Atualizar tipos TypeScript em _shared/types.ts para incluir role nas responses
- [x] Atualizar métodos signIn, signUp e initialize no AuthStore para carregar e salvar role
- [x] Adicionar badge com role na página Account.tsx ao lado do ícone BadgeCheck