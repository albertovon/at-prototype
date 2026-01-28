const q1Select = document.querySelector("#q1");
const q2Select = document.querySelector("#q2");
const q3Select = document.querySelector("#q3");
const disruptionSelect = document.querySelector("#disruptionTiming");
const q2Field = document.querySelector("#q2-field");
const q3Field = document.querySelector("#q3-field");
const disruptionField = document.querySelector("#disruption-field");
const output = document.querySelector("#output");
const status = document.querySelector("#status");
const resetButton = document.querySelector("#reset");

const emptyMessage = "Select answers to see the outcome JSON.";
output.textContent = emptyMessage;

function setStatus(text, state) {
  status.textContent = text;
  status.classList.remove("ready", "error");
  if (state) {
    status.classList.add(state);
  }
}

function clearSelect(select) {
  if (select) {
    select.value = "";
  }
}

function updateVisibility() {
  const q1 = q1Select.value;
  q2Field.hidden = q1 !== "self";
  if (q1 !== "self") {
    clearSelect(q2Select);
    clearSelect(q3Select);
    clearSelect(disruptionSelect);
  }

  const q2 = q2Select.value;
  q3Field.hidden = !(q1 === "self" && q2 === "yes");
  if (!(q1 === "self" && q2 === "yes")) {
    clearSelect(q3Select);
    clearSelect(disruptionSelect);
  }

  const q3 = q3Select.value;
  disruptionField.hidden = !(q1 === "self" && q2 === "yes" && q3 === "next_day");
  if (!(q1 === "self" && q2 === "yes" && q3 === "next_day")) {
    clearSelect(disruptionSelect);
  }
}

function updateOutcome() {
  updateVisibility();

  if (!q1Select.value) {
    output.textContent = emptyMessage;
    setStatus("Awaiting answers");
    return;
  }

  try {
    const result = window.DecisionModel.evaluateDecision({
      q1: q1Select.value,
      q2: q2Select.value || undefined,
      q3: q3Select.value || undefined,
      disruptionTiming: disruptionSelect.value || undefined,
    });
    output.textContent = JSON.stringify(result, null, 2);
    setStatus("Decision ready", "ready");
  } catch (error) {
    output.textContent = error.message;
    setStatus("Missing required input", "error");
  }
}

[q1Select, q2Select, q3Select, disruptionSelect].forEach((select) => {
  select.addEventListener("change", updateOutcome);
});

resetButton.addEventListener("click", () => {
  clearSelect(q1Select);
  clearSelect(q2Select);
  clearSelect(q3Select);
  clearSelect(disruptionSelect);
  updateOutcome();
});

updateOutcome();
