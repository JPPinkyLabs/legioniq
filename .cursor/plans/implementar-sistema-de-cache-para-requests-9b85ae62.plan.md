<!-- 9b85ae62-ad03-45a2-93a7-d8713b5750f5 263c2473-d7fa-4f51-adee-83357d1cd449 -->
# Implementar Sistema de Cache para Requests

## Objetivo

Criar sistema de cache eficiente que armazena respostas da OpenAI por 7 dias, reduzindo chamadas à API e mantendo código limpo na edge function.

## Estrutura da Tabela

Criar tabela `requests_cache` no Supabase com:

- `cache_key` (TEXT PRIMARY KEY): Chave única gerada de category + text_hash + images_key + model
- `request_id` (UUID): ID da request que originou o cache (para rastreamento)
- `category` (app_category): Categoria da request (para indexação)
- `text_hash` (TEXT): Hash SHA-256 de (ocr_text + user_message normalizado)
- `images_key` (TEXT): Hash SHA-256 combinado das imagens (sorted para consistência)
- `result` (JSONB): Objeto `{ model_response: string, ocr_text: string }`
- `created_at` (TIMESTAMPTZ): Data de criação
- `expires_at` (TIMESTAMPTZ): Data de expiração (created_at + 7 dias)

## Implementação

### 1. Migration para criar tabela requests_cache

Arquivo: `supabase/migrations/20250130000000_create_requests_cache.sql`

- Criar tabela com campos acima
- Criar índices:
  - `idx_requests_cache_expires_at` para limpeza automática
  - `idx_requests_cache_category_text_images` para queries de busca
- Habilitar RLS (apenas service_role pode acessar)
- Criar função SQL `cleanup_expired_cache()` para limpeza automática (opcional)

### 2. Atualizar edge function process-screenshot

Arquivo: `supabase/functions/process-screenshot/index.ts`

Adicionar helpers minimalistas após validações e antes do check de limite diário:

**Helper para gerar hash de texto:**

- Normalizar: `(ocr_text || '') + '|' + (user_message || '')`
- Retornar SHA-256 hash

**Helper para gerar hash de imagens:**

- Calcular hash SHA-256 de cada imagem base64
- Ordenar hashes e juntar com ':'
- Retornar hash SHA-256 da string combinada

**Helper para gerar cache_key:**

- Formato: `${category}:${textHash}:${imagesHash}:${model}`
- Retornar hash SHA-256 final

**Lógica principal (após validações, antes de buscar prompt):**

1. Gerar cache_key
2. Verificar cache:
   ```sql
   SELECT result, request_id 
   FROM requests_cache 
   WHERE cache_key = ? AND expires_at > now()
   ```

3. Se cache HIT:

   - Extrair `model_response` e `ocr_text` do result JSONB
   - Fazer upload de imagens
   - Criar request normalmente
   - Retornar resposta com dados do cache

4. Se cache MISS:

   - Verificar limite diário (já existe)
   - Buscar prompt
   - Fazer upload de imagens
   - Chamar OpenAI
   - Salvar no cache: INSERT com expires_at = now() + 7 dias
   - Criar request
   - Retornar resposta

### 3. Estrutura do cache_key

O cache_key será gerado a partir de:

- `category`: Enum 'gameplay' | 'technical' | 'strategy'
- `text_hash`: SHA-256 de (ocr_text normalizado + '|' + user_message normalizado ou '')
- `images_key`: SHA-256 de hashes individuais das imagens (ordenados)
- `model`: Valor de OPENAI_MODEL (ex: 'gpt-4o')

### 4. Limpeza de cache expirado

Criar função SQL que pode ser executada via cron job ou manualmente:

- DELETE FROM requests_cache WHERE expires_at < now()

## Arquivos a Modificar

1. `supabase/migrations/20250130000000_create_requests_cache.sql` (criar)
2. `supabase/functions/process-screenshot/index.ts` (atualizar)

## Benefícios

- Reduz custos de API OpenAI (requisições duplicadas usam cache)
- Mantém edge function limpa (lógica simples de verificação)
- Expiração automática após 7 dias
- Cache compartilhado entre usuários (mesmo input = mesma resposta)