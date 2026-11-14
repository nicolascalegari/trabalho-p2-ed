"use strict";

const $ = (id) => document.getElementById(id);

const state = {
  initialHeap: [],
  heap: [],
  events: [],
  step: 0,
  timer: null,
  activeIndices: [],
  mode: "min",
  operation: "insert"
};

const scenarios = {
  medium: {
    min: { values: [10, 20, 15, 30, 40, 25, 18], value: 12 },
    max: { values: [40, 30, 25, 20, 10, 15, 18], value: 35 }
  },
  worst: {
    min: { values: [2, 5, 3, 9, 7, 8, 6], value: 1 },
    max: { values: [98, 90, 95, 70, 80, 85, 92], value: 100 }
  }
};

function before(a, b, mode) {
  return mode === "min" ? a < b : a > b;
}

function buildHeap(values, mode) {
  const arr = [...values];
  function siftDown(index) {
    while (true) {
      const left = 2 * index + 1;
      const right = 2 * index + 2;
      let best = index;
      if (left < arr.length && before(arr[left], arr[best], mode)) best = left;
      if (right < arr.length && before(arr[right], arr[best], mode)) best = right;
      if (best === index) break;
      [arr[index], arr[best]] = [arr[best], arr[index]];
      index = best;
    }
  }
  for (let i = Math.floor(arr.length / 2) - 1; i >= 0; i--) siftDown(i);
  return arr;
}

function addEvent(events, description, heap, metrics, vars = {}, active = []) {
  events.push({
    description,
    heap: [...heap],
    comparisons: metrics.comparisons,
    swaps: metrics.swaps,
    operations: metrics.operations,
    vars: { ...vars },
    active: [...active]
  });
}

function createTrace() {
  stopPlay();
  const heap = [...state.initialHeap];
  const events = [];
  const metrics = { comparisons: 0, swaps: 0, operations: 0 };
  const mode = state.mode;
  const operation = state.operation;
  addEvent(events, `Estado inicial: ${mode === "min" ? "Min-Heap" : "Max-Heap"} pronto para ${operation === "insert" ? "inserção" : "remoção"}.`, heap, metrics);

  if (operation === "insert") {
    const value = Number($("insertValue").value);
    if (!Number.isInteger(value)) {
      alert("Informe um número inteiro para inserir.");
      return;
    }
    heap.push(value);
    metrics.operations++;
    let index = heap.length - 1;
    addEvent(events, `Inserção: ${value} foi colocado no final do array, no índice ${index}.`, heap, metrics,
      { current: index, parent: index > 0 ? Math.floor((index - 1) / 2) : null }, [index]);

    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      metrics.comparisons++;
      metrics.operations++;
      const shouldSwap = before(heap[index], heap[parent], mode);
      addEvent(events,
        `Comparação: filho ${heap[index]} (índice ${index}) ${shouldSwap ? "tem prioridade sobre" : "não tem prioridade sobre"} pai ${heap[parent]} (índice ${parent}).`,
        heap, metrics, { current: index, parent, left: null, right: null, chosen: shouldSwap ? index : parent }, [index, parent]);
      if (!shouldSwap) break;
      [heap[index], heap[parent]] = [heap[parent], heap[index]];
      metrics.swaps++;
      metrics.operations++;
      addEvent(events, `Sift-up: troca realizada entre os índices ${index} e ${parent}.`, heap, metrics,
        { current: parent, parent: parent > 0 ? Math.floor((parent - 1) / 2) : null, chosen: parent }, [index, parent]);
      index = parent;
    }
    addEvent(events, "Inserção concluída: a propriedade do heap foi restaurada.", heap, metrics);
  } else {
    if (heap.length === 0) {
      addEvent(events, "Não é possível remover: o heap está vazio.", heap, metrics);
    } else {
      const removed = heap[0];
      if (heap.length === 1) {
        heap.pop();
        metrics.operations++;
        addEvent(events, `Remoção concluída: ${removed} era o único elemento do heap.`, heap, metrics);
      } else {
        const last = heap.pop();
        metrics.operations++;
        heap[0] = last;
        metrics.operations++;
        addEvent(events, `A raiz ${removed} foi removida. O último elemento (${last}) foi colocado na raiz.`, heap, metrics,
          { current: 0, parent: null, left: 1, right: 2 }, [0]);

        let index = 0;
        while (true) {
          const left = 2 * index + 1;
          const right = 2 * index + 2;
          let best = index;

          if (left < heap.length) {
            metrics.comparisons++;
            metrics.operations++;
            const leftWins = before(heap[left], heap[best], mode);
            addEvent(events, `Comparação com filho esquerdo: ${heap[left]} ${leftWins ? "tem prioridade sobre" : "não tem prioridade sobre"} ${heap[best]}.`,
              heap, metrics, { current: index, parent: index > 0 ? Math.floor((index - 1) / 2) : null, left, right: right < heap.length ? right : null, chosen: leftWins ? left : best }, [index, left]);
            if (leftWins) best = left;
          }

          if (right < heap.length) {
            metrics.comparisons++;
            metrics.operations++;
            const rightWins = before(heap[right], heap[best], mode);
            addEvent(events, `Comparação com filho direito: ${heap[right]} ${rightWins ? "tem prioridade sobre" : "não tem prioridade sobre"} ${heap[best]}.`,
              heap, metrics, { current: index, parent: index > 0 ? Math.floor((index - 1) / 2) : null, left: left < heap.length ? left : null, right, chosen: rightWins ? right : best }, [index, right]);
            if (rightWins) best = right;
          }

          if (best === index) break;
          [heap[index], heap[best]] = [heap[best], heap[index]];
          metrics.swaps++;
          metrics.operations++;
          addEvent(events, `Sift-down: troca realizada entre os índices ${index} e ${best}.`, heap, metrics,
            { current: best, parent: index, left: 2 * best + 1, right: 2 * best + 2, chosen: best }, [index, best]);
          index = best;
        }
        addEvent(events, `Remoção concluída: a raiz removida foi ${removed}.`, heap, metrics);
      }
    }
  }

  state.events = events;
  state.step = 0;
  renderEvent(0);
  $("status").textContent = "Simulação preparada";
  $("logCount").textContent = `${events.length} eventos`;
  renderLog();
}

function renderTree(heap, active = []) {
  const nodes = $("treeNodes");
  const svg = $("treeLines");
  nodes.innerHTML = "";
  svg.innerHTML = "";
  $("emptyMessage").style.display = heap.length ? "none" : "grid";
  if (!heap.length) {
    $("arrayView").innerHTML = '<span class="muted-log">Array vazio</span>';
    return;
  }

  const depth = Math.floor(Math.log2(heap.length)) + 1;
  const width = Math.max(520, Math.pow(2, depth - 1) * 78);
  const height = Math.max(235, depth * 82);
  nodes.style.width = `${width}px`;
  nodes.style.height = `${height}px`;
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("width", width);
  svg.setAttribute("height", height);

  const positions = [];
  heap.forEach((value, index) => {
    const level = Math.floor(Math.log2(index + 1));
    const firstAtLevel = Math.pow(2, level) - 1;
    const positionInLevel = index - firstAtLevel;
    const nodesAtLevel = Math.pow(2, level);
    const x = ((positionInLevel + 0.5) / nodesAtLevel) * width;
    const y = 35 + level * 72;
    positions.push({ x, y });
  });

  heap.forEach((value, index) => {
    if (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      const p = positions[parent], c = positions[index];
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", p.x); line.setAttribute("y1", p.y + 18);
      line.setAttribute("x2", c.x); line.setAttribute("y2", c.y - 18);
      line.setAttribute("class", "tree-edge");
      svg.appendChild(line);
    }
  });

  heap.forEach((value, index) => {
    const node = document.createElement("div");
    node.className = `tree-node${index === 0 ? " root" : ""}${active.includes(index) ? " active" : ""}`;
    node.style.left = `${positions[index].x}px`;
    node.style.top = `${positions[index].y}px`;
    node.textContent = value;
    node.title = `Índice ${index} · valor ${value}`;
    nodes.appendChild(node);
  });

  $("arrayView").innerHTML = "";
  heap.forEach((value, index) => {
    const cell = document.createElement("div");
    cell.className = `array-cell${active.includes(index) ? " active" : ""}`;
    cell.innerHTML = `<strong>${value}</strong><small>índice ${index}</small>`;
    $("arrayView").appendChild(cell);
  });
}

function renderEvent(index) {
  const event = state.events[index];
  if (!event) return;
  state.step = index;
  renderTree(event.heap, event.active);
  $("stepMetric").textContent = `${index + 1} / ${state.events.length}`;
  $("comparisons").textContent = event.comparisons;
  $("swaps").textContent = event.swaps;
  $("operations").textContent = event.operations;
  $("stepDescription").textContent = event.description;
  $("currentIndex").textContent = showValue(event.vars.current);
  $("parentIndex").textContent = showValue(event.vars.parent);
  $("leftIndex").textContent = showValue(event.vars.left);
  $("rightIndex").textContent = showValue(event.vars.right);
  $("chosenIndex").textContent = showValue(event.vars.chosen);
  $("status").textContent = index === state.events.length - 1 ? "Concluído" : "Em andamento";
  renderLog();
}

function showValue(value) {
  return value === undefined || value === null ? "—" : value;
}

function renderLog() {
  const log = $("eventLog");
  log.innerHTML = "";
  state.events.forEach((event, index) => {
    const item = document.createElement("li");
    item.textContent = `${index + 1}. ${event.description}`;
    if (index === state.step) item.classList.add("current");
    log.appendChild(item);
  });
  const current = log.querySelector(".current");
  if (current) current.scrollIntoView({ block: "nearest" });
}

function nextStep() {
  if (!state.events.length) createTrace();
  if (state.step < state.events.length - 1) renderEvent(state.step + 1);
  else stopPlay();
}

function play() {
  if (!state.events.length) createTrace();
  if (state.step >= state.events.length - 1) renderEvent(0);
  stopPlay();
  $("status").textContent = "Executando";
  state.timer = window.setInterval(() => {
    if (state.step >= state.events.length - 1) {
      stopPlay();
      $("status").textContent = "Concluído";
      return;
    }
    renderEvent(state.step + 1);
  }, 950);
}

function stopPlay() {
  if (state.timer !== null) {
    window.clearInterval(state.timer);
    state.timer = null;
  }
}

function reset() {
  stopPlay();
  if (state.events.length) renderEvent(0);
  else {
    renderTree(state.initialHeap);
    $("stepMetric").textContent = "0 / 0";
    $("comparisons").textContent = "0";
    $("swaps").textContent = "0";
    $("operations").textContent = "0";
  }
  $("status").textContent = "Reiniciado";
}

function loadScenario(name) {
  stopPlay();
  const mode = $("heapType").value;
  let values, value;
  if (name === "custom") {
    const raw = $("customValues").value.trim();
    const parsed = raw ? raw.split(",").map(part => Number(part.trim())) : [];
    if (parsed.some(number => !Number.isInteger(number))) {
      alert("Use somente números inteiros separados por vírgula.");
      return;
    }
    values = parsed;
    value = mode === "min" ? -1 : 100;
  } else {
    ({ values, value } = scenarios[name][mode]);
  }
  state.mode = mode;
  state.operation = $("operation").value;
  state.initialHeap = buildHeap(values, mode);
  $("insertValue").value = value;
  $("operation").value = "insert";
  state.operation = "insert";
  updateOperationField();
  createTrace();
}

function updateOperationField() {
  $("valueField").style.display = $("operation").value === "insert" ? "flex" : "none";
  state.operation = $("operation").value;
}

$("startBtn").addEventListener("click", () => {
  state.mode = $("heapType").value;
  state.operation = $("operation").value;
  createTrace();
});
$("playBtn").addEventListener("click", play);
$("stepBtn").addEventListener("click", () => { stopPlay(); nextStep(); });
$("pauseBtn").addEventListener("click", () => { stopPlay(); $("status").textContent = "Pausado"; });
$("resetBtn").addEventListener("click", reset);
$("operation").addEventListener("change", updateOperationField);
$("heapType").addEventListener("change", () => {
  state.mode = $("heapType").value;
  loadScenario("medium");
});
document.querySelectorAll(".scenario").forEach(button => {
  button.addEventListener("click", () => loadScenario(button.dataset.scenario));
});

updateOperationField();
loadScenario("medium");
