

## Problema Identificado

O sistema externo (SIM) esta enviando o campo `department` como **UUID** (ex: `6a460ef3-5437-4441-9632-0f08e10bf618`) em vez de enviar o **nome do setor** (ex: `"Desenvolvimento"`). Por isso, o filtro por setor no frontend nao funciona -- o gestor Deivid ve solicitacoes de todos os setores, incluindo a da Bruna (CS).

**Dados atuais no banco:**
- Deivid Castilho: department = `3167e9c6-...`, `6a460ef3-...`
- Rafael Coura: department = `6a460ef3-...`
- Bruna Pereira da Cruz: department = `b916d8da-...`

Todos com UUIDs, nenhum com nome legivel.

---

## Solucao

### 1. Webhook: Adicionar mapeamento de UUID para nome do setor

No arquivo `supabase/functions/webhook-vacation-request/index.ts`, adicionar um dicionario que mapeia os UUIDs dos departamentos do sistema externo para os nomes usados internamente. Quando o webhook receber um UUID no campo `department`, ele converte automaticamente para o nome correto antes de salvar.

```text
Exemplo de mapeamento:
"6a460ef3-5437-4441-9632-0f08e10bf618" -> "Desenvolvimento"
"b916d8da-30ea-4fce-a57c-a89f6c0cb217" -> "CS"
"3167e9c6-3bf5-4013-8920-bae3a0963518" -> (setor do Deivid - precisa confirmar)
```

Se o UUID nao estiver no mapa, o valor original sera mantido (caso ja venha como string).

### 2. Corrigir dados existentes no banco

Executar um UPDATE nos registros existentes para substituir os UUIDs pelos nomes corretos dos setores.

### 3. Frontend: nenhuma alteracao necessaria

O codigo de `SolicitacaoFerias.tsx` ja filtra corretamente usando `.in("department", gestorDepartments)`. Uma vez que os dados estejam com nomes em vez de UUIDs, o filtro funcionara automaticamente.

---

## Pergunta necessaria

Preciso confirmar o mapeamento correto de cada UUID para o nome do setor. Baseado nos dados:
- `6a460ef3-5437-4441-9632-0f08e10bf618` = Desenvolvimento? (usado por Deivid e Rafael)
- `b916d8da-30ea-4fce-a57c-a89f6c0cb217` = CS? (usado por Bruna)
- `3167e9c6-3bf5-4013-8920-bae3a0963518` = ? (usado por Deivid em outra solicitacao)

Alem disso, caso existam outros setores no sistema externo, o mapeamento completo seria necessario. Se voce puder fornecer a lista de UUIDs e seus setores correspondentes, a implementacao sera mais precisa.

---

## Detalhes Tecnicos

**Arquivo:** `supabase/functions/webhook-vacation-request/index.ts`
- Adicionar constante `DEPARTMENT_UUID_MAP` com o mapeamento UUID -> nome
- Antes de inserir no banco, verificar se `payload.employee.department` e um UUID e converter para o nome correspondente

**Migracao SQL:**
- UPDATE nas linhas existentes da tabela `vacation_requests` para corrigir os UUIDs para nomes

**Arquivos inalterados:**
- `src/pages/gestores/SolicitacaoFerias.tsx` -- o filtro ja esta correto, so precisa dos dados corretos

