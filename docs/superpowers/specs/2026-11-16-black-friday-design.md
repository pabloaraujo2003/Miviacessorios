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

## Card de produto (só produtos em promoção: com desconto e em estoque)
- Durante a campanha, o selo vermelho `-X% OFF` vira uma etiqueta preta "pendurada" no topo
  direito da foto (`-X%` em vermelho + `BLACK FRIDAY`). O aviso de estoque baixo desce para o
  canto inferior esquerdo para não colidir.
- Abaixo do preço: `Economize R$ Y` em verde (só para preço único).
- Produtos sem desconto não mudam.

## Carrossel de destaques (substitui a foto estática do topo)
- `HeroCarousel`: até 5 produtos — na campanha, os em promoção; fora dela, os mais recentes em estoque.
- Celular: 1 slide por vez, foto de ponta a ponta com nome, preço e botão. Desktop: 3 slides
  lado a lado em 4:5 (sem cortar as fotos).
- Avança sozinho a cada 5s (pausa ao tocar/passar o mouse, respeita reduced-motion); deslizar é nativo (scroll-snap).
- Botão "Ver ofertas" ativa o filtro Black Friday e desce até o catálogo ("Ver coleção" fora da campanha).
- A foto de capa do Admin (`settings.hero_image_url`) deixa de ser exibida.

## Catálogo
- O filtro de categorias fica grudado abaixo do header ao rolar (altura do header em `--header-h`).
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
