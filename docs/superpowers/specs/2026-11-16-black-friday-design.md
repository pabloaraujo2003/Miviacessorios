# Black Friday — design

## Objetivo
Campanha de Black Friday no site, ligada por datas fixas no código, destacando os
produtos que já têm desconto cadastrado no Admin (`products."discountPercent"`).

## Ativação
- `src/lib/campaign.ts` exporta `BLACK_FRIDAY = { start, end }` em horário de Brasília:
  2026-11-16T00:00:00-03:00 até 2026-11-30T23:59:59-03:00.
- `isBlackFridayActive(now?)` → true dentro do intervalo.
- Em `import.meta.env.DEV`, `?bf=1` na URL força a campanha (para pré-visualizar). Sem efeito em produção.
- Fora do intervalo o site fica idêntico ao atual (exceto a linha de economia na sacola, abaixo).
- Nenhuma alteração no banco, nem no Admin.

## Header
- Faixa preta acima do header existente: `BLACK FRIDAY · ATÉ X% OFF · ATÉ 30/11`.
- X = maior `discountPercent` entre os produtos carregados; sem produtos com desconto, a faixa mostra só `BLACK FRIDAY · ATÉ 30/11`.
- O header é `fixed`; um espaçador em fluxo com a altura da faixa é renderizado junto,
  para que as páginas não precisem mudar o padding.

## Card de produto (só produtos com desconto e em estoque)
- Durante a campanha, o selo vermelho `-X% OFF` é substituído por uma faixa preta de ponta
  a ponta na base da foto: `BLACK FRIDAY` à esquerda, `-X%` em vermelho à direita.
- Abaixo do preço: `Economize R$ Y` em verde (diferença entre original e final do preço de vitrine).
- Produtos sem desconto não mudam.

## Catálogo
- Chip `Black Friday` como primeira opção do filtro de categorias (só durante a campanha),
  filtrando produtos com desconto; mostra a contagem.
- Durante a campanha, produtos com desconto vêm primeiro; dentro de cada grupo mantém-se a
  ordem atual (mais recentes primeiro). Ordenação estável no cliente.

## Sacola e WhatsApp
- Linha `Você economizou R$ Z` no resumo sempre que houver item com desconto (com ou sem campanha).
- Durante a campanha, a mensagem do WhatsApp começa com `🖤 *Pedido Black Friday*` e inclui
  `*Você economizou:* R$ Z`.

## Verificação
- `npm run build` e `npm run lint` sem erros.
- `npm run dev` com `?bf=1`: conferir faixa do header, cards com faixa e economia, chip de filtro,
  ordenação e sacola em viewport mobile; sem `?bf=1`, conferir que o visual é o atual.
