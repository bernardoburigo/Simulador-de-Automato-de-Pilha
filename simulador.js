// TRANSIÇÕES DO AP
const transitions = [
    { state: "q0", read: "ε", top: "ε", push: "S", to: "q1", rule: "(ε,ε→S)" },

    // Regras da GLC
    { state: "q1", read: "ε", top: "S", push: "aD", to: "q1", rule: "S→aD" },
    { state: "q1", read: "ε", top: "S", push: "cC", to: "q1", rule: "S→cC" },

    { state: "q1", read: "c", top: "C", push: "ε", to: "q1", rule: "C→c" },
    { state: "q1", read: "b", top: "B", push: "ε", to: "q1", rule: "B→b" },

    { state: "q1", read: "ε", top: "D", push: "aDB", to: "q1", rule: "D→aDB" },
    { state: "q1", read: "ε", top: "D", push: "cCB", to: "q1", rule: "D→cCB" },

    // Terminais
    { state: "q1", read: "a", top: "a", push: "ε", to: "q1", rule: "a→ε" },
    { state: "q1", read: "b", top: "b", push: "ε", to: "q1", rule: "b→ε" },
    { state: "q1", read: "c", top: "c", push: "ε", to: "q1", rule: "c→ε" },

    // Finalização
    { state: "q1", read: "ε", top: "ε", push: "ε", to: "q2", rule: "Fim(q1→q2)" }
];

// UTILIDADES
function pushStr(stack, str) {
    if (!str || str === "ε") return;
    for (let i = str.length - 1; i >= 0; i--) stack.push(str[i]);
}

function peek(stack) {
    return stack.length ? stack[stack.length - 1] : "ε";
}

// BUSCA RECURSIVA
function findAcceptingPath(state, input, stack, pathSoFar, visited, depth, maxDepth = 2000) {
    if (depth > maxDepth) return null;

    if (state === "q2" && input === "" && stack.length === 0) {
        return pathSoFar.slice();
    }

    const key = `${state}|${input}|${stack.join("")}`;
    if (visited.has(key)) return null;
    visited.add(key);

    const possibleReads = [];
    if (state === "q0") {
        possibleReads.push("ε");
    } else {
        const nextSym = input[0] || "ε";
        if (nextSym !== "ε") possibleReads.push(nextSym);
        possibleReads.push("ε");
    }

    const top = peek(stack);

    for (const t of transitions) {
        if (t.state !== state) continue;
        if (!possibleReads.includes(t.read)) continue;
        if (t.top !== top) continue;

        const newStack = stack.slice();
        if (t.top !== "ε") newStack.pop();
        pushStr(newStack, t.push);

        const newInput = (t.read !== "ε") ? input.substring(1) : input;
        const newState = t.to;

        const stepRecord = {
            rule: t.rule,
            state: newState,
            input: newInput,
            stack: newStack.slice()
        };

        pathSoFar.push(stepRecord);
        const result = findAcceptingPath(newState, newInput, newStack, pathSoFar, visited, depth + 1, maxDepth);
        if (result) return result;
        pathSoFar.pop();
    }

    return null;
}

// TABELA DE PASSOS
function renderSteps(path) {
    const tbody = document.querySelector("#stepsTable tbody");
    tbody.innerHTML = "";

    let step = 0;

    const initialRow = document.createElement("tr");
    initialRow.innerHTML =
        `<td>${step++}</td><td>q0</td><td id="input-start">--</td><td>ε</td><td>Início</td>`;
    tbody.appendChild(initialRow);

    for (const p of path) {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${step++}</td>
            <td>${p.state}</td>
            <td>${p.input || "ε"}</td>
            <td>${p.stack.length > 0 ? p.stack.join("") : "ε"}</td>
            <td>${p.rule}</td>`;
        tbody.appendChild(tr);
    }
}


// SIMULAÇÃO PRINCIPAL
function simulateND() {
    const raw = document.getElementById("inputWord").value.trim();
    const resultEl = document.getElementById("result");
    const tbody = document.querySelector("#stepsTable tbody");

    tbody.innerHTML = "";
    resultEl.innerHTML = "";

    if (!/^[abc]*$/.test(raw)) {
        resultEl.innerHTML =
            "<span class='rejected'>Símbolos inválidos (use apenas a,b,c)</span>";
        return;
    }

    const visited = new Set();
    const pathSoFar = [];

    const acceptingPath = findAcceptingPath("q0", raw, [], pathSoFar, visited, 0, 2000);

    if (acceptingPath) {
        renderSteps(acceptingPath);
        resultEl.innerHTML = "<span class='accepted'>ACEITA</span>";
        document.getElementById("input-start").innerText = raw || "ε";
    } else {
        tbody.innerHTML =
            `<tr><td>0</td><td>q0</td><td>${raw || "ε"}</td><td>ε</td><td>Início</td></tr>`;
        resultEl.innerHTML =
            "<span class='rejected'>REJEITADA — sem transições</span>";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const btn = document.querySelector("button");
    btn.removeAttribute("onclick");
    btn.addEventListener("click", simulateND);
});
