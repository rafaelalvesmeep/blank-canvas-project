

## Resumo
Adicionar um modal (Dialog) que abre ao clicar em uma linha da tabela de solicitações de férias, exibindo todos os dados detalhados da solicitação, incluindo observações.

---

## Alterações

**Arquivo:** `src/pages/gestores/SolicitacaoFerias.tsx`

1. **Adicionar estado para controlar o modal e a solicitação selecionada:**
   - `selectedSolicitacao` para armazenar a solicitação clicada
   - O Dialog abre quando `selectedSolicitacao` nao for null

2. **Tornar as linhas da tabela clicaveis:**
   - Adicionar `cursor-pointer` e `onClick` em cada `TableRow` para abrir o modal com os dados daquela solicitacao

3. **Criar o Dialog com todos os dados:**
   - Nome do colaborador
   - Email
   - Setor/Departamento
   - Periodo (data inicio - data fim)
   - Quantidade de dias
   - Data da solicitacao
   - Status (com icone e badge colorido)
   - Aprovado por (se houver)
   - Observacoes/Notas (campo `notes`)
   - ID externo (`external_id`)
   - Botoes de Aprovar/Reprovar (se status pendente)

---

## Detalhes Tecnicos

**Imports adicionais:**
- `Dialog, DialogContent, DialogHeader, DialogTitle` de `@/components/ui/dialog`
- `Separator` de `@/components/ui/separator`
- `useState` do React

**Estado:**
```text
const [selectedSolicitacao, setSelectedSolicitacao] = useState<any | null>(null);
```

**TableRow clicavel:**
```text
<TableRow 
  key={sol.id} 
  className="group cursor-pointer hover:bg-muted/50"
  onClick={() => setSelectedSolicitacao(sol)}
>
```

**Estrutura do Dialog:**
```text
<Dialog open={!!selectedSolicitacao} onOpenChange={(open) => !open && setSelectedSolicitacao(null)}>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle>Detalhes da Solicitacao</DialogTitle>
    </DialogHeader>
    - Secao com nome, email, setor
    - Separator
    - Secao com periodo, dias, data solicitacao
    - Separator
    - Secao com status e aprovado por
    - Separator
    - Secao com observacoes (notes)
    - Separator
    - Secao com ID externo
    - Botoes de acao (se pendente)
  </DialogContent>
</Dialog>
```

Os botoes de aprovar/reprovar dentro do modal fecharao o modal apos a acao, chamando `setSelectedSolicitacao(null)` no callback de sucesso da mutation.

