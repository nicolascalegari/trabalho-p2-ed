# Trabalho P2 — Estruturas de Dados
## Tema C: Heaps e Filas de Prioridade (Min-Heap / Max-Heap)

> **Identificação**
> - Nome completo: **[Nicolas A. Calegari]**
> - RA: **[2840482521013]**
> - Tema: **C — Heaps e Filas de Prioridade**
> - Vídeo de apresentação: **[https://youtu.be/0peHz7tIso4]**

## 1. Objetivo

Este trabalho implementa um Heap Binário em Python puro e apresenta um simulador visual interativo para acompanhar as operações de inserção (`sift-up`) e remoção da raiz (`sift-down`). A estrutura pode operar como Min-Heap ou Max-Heap.

## 2. Resumo teórico

Uma **fila de prioridade** é uma estrutura de dados em que cada elemento possui uma prioridade. Em vez de remover necessariamente o elemento que entrou primeiro, a estrutura permite consultar ou remover o elemento de maior ou menor prioridade.

O **Heap Binário** é uma maneira eficiente de implementar uma fila de prioridade. É uma árvore binária completa: todos os níveis estão preenchidos, exceto possivelmente o último, que é preenchido da esquerda para a direita. Por ser completa, a árvore pode ser armazenada em um array, sem a necessidade de criar objetos de nós e ponteiros.

Existem duas variantes principais:

- **Min-Heap:** o valor de cada nó pai é menor ou igual aos valores de seus filhos. O menor elemento fica na raiz, no índice `0`.
- **Max-Heap:** o valor de cada nó pai é maior ou igual aos valores de seus filhos. O maior elemento fica na raiz, no índice `0`.

A propriedade do heap não significa que o array inteiro esteja ordenado. Ela garante somente a relação entre cada pai e seus filhos.

### 2.1 Relação entre árvore e array

Considerando índices iniciados em zero, para um elemento na posição `i`:

| Relação | Fórmula |
|---|---|
| Pai | `(i - 1) // 2` |
| Filho esquerdo | `2 * i + 1` |
| Filho direito | `2 * i + 2` |

Exemplo de Min-Heap:

```text
             8
           /   \
         12     10
        /  \   /  \
       20  18 15  30

Array: [8, 12, 10, 20, 18, 15, 30]
```

### 2.2 Operações principais

**Inserção (`insert` / `sift-up`)**

1. O novo valor é colocado na próxima posição livre do array, mantendo a árvore completa.
2. Compara-se o novo elemento com seu pai.
3. Se o novo elemento tiver maior prioridade, os dois trocam de posição.
4. O processo continua até que a propriedade do heap seja satisfeita ou o elemento chegue à raiz.

**Remoção da raiz (`extract_root` / `sift-down`)**

1. Guarda-se o elemento da raiz, que é o menor no Min-Heap ou o maior no Max-Heap.
2. O último elemento do array ocupa a posição da raiz.
3. Compara-se o elemento com seus filhos e escolhe-se o filho de maior prioridade.
4. Se o filho escolhido tiver prioridade maior, ocorre uma troca.
5. O processo continua até restaurar a propriedade do heap.

**Consulta (`peek`)**

Retorna o elemento da raiz sem removê-lo. Como a raiz está sempre no índice zero, a consulta é `O(1)`.

### 2.3 Onde é utilizado no mundo real?

Heaps são utilizados em sistemas que precisam selecionar repetidamente o elemento de maior ou menor prioridade. Alguns exemplos:

- **Escalonamento de tarefas:** selecionar processos ou tarefas conforme sua prioridade.
- **Filas de atendimento:** organizar solicitações que devem ser atendidas por prioridade.
- **Algoritmos de grafos:** a fila de prioridade pode selecionar o próximo vértice com menor distância estimada, como no algoritmo de Dijkstra.
- **Simulações e sistemas de eventos:** processar primeiro o evento cujo horário ou prioridade deve ser considerado menor.

## 3. Complexidade assintótica (Big-O)

Considere `n` como a quantidade de elementos no heap. Como a árvore é completa, sua altura é proporcional a `log₂(n)`. Assim, uma operação que percorre um caminho entre uma folha e a raiz pode visitar, no máximo, uma quantidade logarítmica de níveis.

A tabela abaixo considera as operações de inserção e remoção da raiz implementadas neste projeto:

| Operação | Melhor caso | Caso médio | Pior caso |
|---|---:|---:|---:|
| Inserção (`insert`) | `O(1)` | `O(log n)` | `O(log n)` |
| Remoção da raiz (`extract_root`) | `O(1)` | `O(log n)` | `O(log n)` |
| Consulta à raiz (`peek`) | `O(1)` | `O(1)` | `O(1)` |
| Construção bottom-up | `O(n)` | `O(n)` | `O(n)` |

### 3.1 Por que ocorre o pior caso?

- **Inserção:** o pior caso ocorre quando o novo valor precisa subir por todos os níveis da árvore até chegar à raiz. Isso pode exigir uma quantidade de comparações e trocas proporcional à altura do heap: `O(log n)`.
- **Remoção:** o pior caso ocorre quando o último elemento colocado na raiz precisa descer por todos os níveis até encontrar sua posição correta. Novamente, o caminho tem tamanho proporcional à altura: `O(log n)`.
- **Melhor caso de inserção:** ocorre quando o elemento inserido já está na posição correta e não precisa trocar com o pai.
- **Melhor caso de remoção:** ocorre quando, após substituir a raiz pelo último elemento, não é necessária nenhuma troca (ou quando havia apenas um elemento).
- **Construção bottom-up:** o procedimento começa nos nós internos mais baixos e aplica `sift-down`. Embora uma chamada isolada possa custar `O(log n)`, a soma do trabalho de todos os nós é `O(n)`.

### 3.2 Espaço auxiliar

As operações `sift-up` e `sift-down` foram implementadas iterativamente. Portanto, utilizam **`O(1)` de espaço auxiliar** além do array que armazena o próprio heap. O array ocupa `O(n)` de espaço para guardar os elementos.

A construção bottom-up também utiliza `O(1)` de espaço auxiliar, desconsiderando o array de entrada/armazenamento.

## 4. Instrumentação e contagem de operações

A implementação em `src/algoritmo.py` possui a classe `Metrics`, que registra:

- **Comparações:** quantas comparações entre valores do heap foram realizadas.
- **Trocas (`swaps`):** quantas vezes dois elementos trocaram de posição.
- **Operações:** total instrumentado de comparações, trocas e escritas/remoções de elementos.

A contagem é uma instrumentação didática, não uma medição de tempo de execução. O total de operações segue a definição explícita acima; por isso, deve ser interpretado junto com os contadores individuais.

## 5. Como executar

### Implementação Python

Requisitos: Python 3.10 ou superior. Não são necessárias bibliotecas externas.

Na raiz do projeto, execute:

```bash
python3 src/algoritmo.py
```

O programa executa três cenários:
1. Caso comum: inserção e remoção em Min-Heap.
2. Caso de borda: tentativa de remoção em heap vazio e operação com um único elemento.
3. Pior caso didático: inserção de um valor que sobe vários níveis no Min-Heap.

### Simulador visual

Abra o arquivo `src/demo/index.html` diretamente em um navegador atualizado. O simulador não depende de servidor, instalação de pacotes ou backend.

Controles disponíveis:
- **Preparar operação:** gera a sequência de eventos para a operação selecionada.
- **Executar / Play:** percorre automaticamente os eventos.
- **Próximo passo:** avança um evento.
- **Pausar:** interrompe a reprodução automática.
- **Reiniciar:** retorna ao primeiro evento da simulação atual.
- **Caso Médio / Pior Caso / Exemplo Customizado:** carrega conjuntos de dados para experimentar.

O simulador mostra a árvore, o array, o log, as variáveis auxiliares e os contadores de comparações, trocas e operações. O código JavaScript reproduz a lógica do algoritmo para permitir a animação local no navegador; a implementação de referência avaliada em Python está separada em `src/algoritmo.py`.

## 6. Estrutura de arquivos

```text
trabalho-p2-ed/
├── README.md
└── src/
    ├── algoritmo.py
    └── demo/
        ├── index.html
        ├── styles.css
        └── app.js
```

## 7. Diário de Engenharia com IA

**Ferramenta/modelo utilizado:** ChatGPT — GPT-6 (OpenAI).

Os prompts abaixo registram os principais pedidos utilizados como apoio ao aprendizado, à implementação e ao refinamento do simulador. Ajuste esta seção para refletir fielmente as interações que você realmente realizou e as ferramentas que efetivamente utilizou.

**Prompt 1 — Aprendizado do conteúdo**

> Explique Heap Binário, Min-Heap e Max-Heap desde os conceitos básicos. Mostre como funcionam as fórmulas de índices em um array, as operações de inserção com sift-up e remoção da raiz com sift-down, usando exemplos passo a passo.

**Prompt 2 — Implementação Python**

> Desenvolva uma implementação de Min-Heap e Max-Heap em Python puro, sem utilizar heapq, sort ou sorted para a estrutura principal. Inclua type hints, docstrings, contadores de comparações, trocas e operações, além de três cenários de teste: comum, borda e pior caso.

**Prompt 3 — Simulador visual**

> Crie um simulador didático de Heap Binário com HTML, CSS e JavaScript, que funcione abrindo o index.html diretamente no navegador. Use uma interface clara, com bom contraste, e permita alternar entre Min-Heap e Max-Heap, executar inserção e remoção passo a passo, pausar, reiniciar, carregar cenários e visualizar árvore, array, log e métricas.

**Reflexão sobre o uso da IA:** a ferramenta foi utilizada como apoio para organizar os conceitos, elaborar uma implementação inicial e estruturar o simulador. O código e os resultados devem ser executados, testados e compreendidos pelo estudante antes da entrega. Registre também as correções e adaptações que você fizer durante o desenvolvimento.

## 8. Vídeo de apresentação

**Link:** [https://youtu.be/0peHz7tIso4]
