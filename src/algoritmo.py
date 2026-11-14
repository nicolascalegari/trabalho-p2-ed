"""
Implementação de Heap Binário (Min-Heap ou Max-Heap).

A implementação usa somente recursos nativos do Python. Não utiliza
heapq, sorted ou sort para implementar a estrutura principal.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, Literal


HeapType = Literal["min", "max"]


@dataclass
class Metrics:
    """Contadores usados para observar o custo das operações."""

    comparisons: int = 0
    swaps: int = 0
    operations: int = 0

    def reset(self) -> None:
        """Zera os contadores."""
        self.comparisons = 0
        self.swaps = 0
        self.operations = 0


class BinaryHeap:
    """
    Heap Binário implementado sobre uma lista.

    Em um Min-Heap, cada pai é menor ou igual aos seus filhos.
    Em um Max-Heap, cada pai é maior ou igual aos seus filhos.

    Índices para um nó i (indexação iniciada em zero):
        pai:       (i - 1) // 2
        filho esq: 2 * i + 1
        filho dir: 2 * i + 2
    """

    def __init__(self, values: Iterable[int] = (), heap_type: HeapType = "min"):
        if heap_type not in ("min", "max"):
            raise ValueError("heap_type deve ser 'min' ou 'max'.")

        self.heap_type: HeapType = heap_type
        self.data: list[int] = list(values)
        self.metrics = Metrics()

        # Construção bottom-up: O(n).
        for index in range(len(self.data) // 2 - 1, -1, -1):
            self._sift_down(index)

    def __len__(self) -> int:
        return len(self.data)

    def _comes_before(self, first: int, second: int) -> bool:
        """Compara dois valores conforme o tipo de heap e registra a comparação."""
        self.metrics.comparisons += 1
        self.metrics.operations += 1

        if self.heap_type == "min":
            return first < second
        return first > second

    def _swap(self, first_index: int, second_index: int) -> None:
        """Troca dois elementos e registra a operação."""
        self.data[first_index], self.data[second_index] = (
            self.data[second_index],
            self.data[first_index],
        )
        self.metrics.swaps += 1
        self.metrics.operations += 1

    def _sift_up(self, index: int) -> None:
        """Restaura a propriedade do heap subindo o elemento inserido."""
        while index > 0:
            parent = (index - 1) // 2

            if not self._comes_before(self.data[index], self.data[parent]):
                break

            self._swap(index, parent)
            index = parent

    def _sift_down(self, index: int) -> None:
        """Restaura a propriedade do heap descendo o elemento fora de posição."""
        size = len(self.data)

        while True:
            left = 2 * index + 1
            right = 2 * index + 2
            best = index

            if left < size and self._comes_before(self.data[left], self.data[best]):
                best = left

            if right < size and self._comes_before(self.data[right], self.data[best]):
                best = right

            if best == index:
                break

            self._swap(index, best)
            index = best

    def insert(self, value: int) -> None:
        """Insere um valor no heap em O(log n) no pior caso."""
        self.data.append(value)
        self.metrics.operations += 1  # escrita do novo elemento
        self._sift_up(len(self.data) - 1)

    def peek(self) -> int:
        """Retorna a raiz sem removê-la. Custo O(1)."""
        if not self.data:
            raise IndexError("Não é possível consultar a raiz de um heap vazio.")
        return self.data[0]

    def extract_root(self) -> int:
        """
        Remove e retorna a raiz (mínimo ou máximo).

        A raiz é substituída pelo último elemento e o heap é restaurado
        com sift-down. Custo O(log n) no pior caso.
        """
        if not self.data:
            raise IndexError("Não é possível remover de um heap vazio.")

        root = self.data[0]
        last = self.data.pop()
        self.metrics.operations += 1  # remoção do último elemento

        if self.data:
            self.data[0] = last
            self.metrics.operations += 1  # escrita na raiz
            self._sift_down(0)

        return root

    def is_valid(self) -> bool:
        """Verifica a propriedade do heap; útil para testes."""
        for child in range(1, len(self.data)):
            parent = (child - 1) // 2
            if self.heap_type == "min" and self.data[child] < self.data[parent]:
                return False
            if self.heap_type == "max" and self.data[child] > self.data[parent]:
                return False
        return True

    def snapshot_metrics(self) -> dict[str, int]:
        """Retorna uma cópia dos contadores."""
        return {
            "comparisons": self.metrics.comparisons,
            "swaps": self.metrics.swaps,
            "operations": self.metrics.operations,
        }


def run_scenarios() -> None:
    """Executa três cenários didáticos e imprime resultados e métricas."""

    print("=" * 60)
    print("CENÁRIO 1 — Caso comum: inserir e remover em Min-Heap")
    heap = BinaryHeap([18, 25, 30, 40, 35, 42], "min")
    print("Heap inicial:", heap.data)
    heap.insert(12)
    print("Após inserir 12:", heap.data)
    removed = heap.extract_root()
    print("Raiz removida:", removed)
    print("Heap final:", heap.data)
    print("Válido?", heap.is_valid())
    print("Métricas:", heap.snapshot_metrics())

    print("\n" + "=" * 60)
    print("CENÁRIO 2 — Caso de borda: heap vazio e elemento único")
    empty_heap = BinaryHeap([], "max")
    try:
        empty_heap.extract_root()
    except IndexError as error:
        print("Remoção em heap vazio:", error)

    empty_heap.insert(7)
    print("Após inserir 7:", empty_heap.data)
    print("Raiz consultada:", empty_heap.peek())
    print("Elemento removido:", empty_heap.extract_root())
    print("Heap final:", empty_heap.data)
    print("Métricas:", empty_heap.snapshot_metrics())

    print("\n" + "=" * 60)
    print("CENÁRIO 3 — Pior caso didático: inserção sobe vários níveis")
    worst_heap = BinaryHeap([2, 5, 3, 9, 7, 8, 6], "min")
    print("Heap inicial:", worst_heap.data)
    worst_heap.insert(1)
    print("Após inserir 1:", worst_heap.data)
    print("Válido?", worst_heap.is_valid())
    print("Métricas:", worst_heap.snapshot_metrics())


if __name__ == "__main__":
    run_scenarios()
