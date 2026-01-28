const q1Group = document.querySelector("#q1");
const q2Group = document.querySelector("#q2");
const q3Group = document.querySelector("#q3");
const disruptionToggle = document.querySelector("#disruptionTiming");
const q2Field = document.querySelector("#q2-field");
const q3Field = document.querySelector("#q3-field");
const output = document.querySelector("#output");
const status = document.querySelector("#status");
const resetButton = document.querySelector("#reset");

const emptyMessage = "Select answers to see the decision outcome.";
output.textContent = emptyMessage;

const outcomeLabels = {
  arrivedAtFinalDestination: "Arrived at final destination",
  alternativeTransportProvidedBy: "Alternative transport provided by",
  ticketRefund: "Ticket refund eligible",
  ticketRefundPlus: "Ticket refund plus eligible",
  reasonableMeasuresFulfilled: "Reasonable measures fulfilled",
  scenario: "Scenario",
};

function setStatus(text, state) {
  status.textContent = text;
  status.classList.remove("ready", "error");
  if (state) {
    status.classList.add(state);
  }
}

function getSelectedValue(container, name) {
  const selected = container.querySelector(`input[name=\"${name}\"]:checked`);
  return selected ? selected.value : "";
}

function clearGroup(container) {
  container.querySelectorAll("input[type=\"radio\"]").forEach((input) => {
    input.checked = false;
  });
}

function updateVisibility() {
  const q1 = getSelectedValue(q1Group, "q1");
  q2Field.hidden = q1 !== "self";
  if (q1 !== "self") {
    clearGroup(q2Group);
    clearGroup(q3Group);
  }

  const q2 = getSelectedValue(q2Group, "q2");
  q3Field.hidden = !(q1 === "self" && q2 === "yes");
  if (!(q1 === "self" && q2 === "yes")) {
    clearGroup(q3Group);
  }
}

function formatValue(value) {
  if (value === null) {
    return "Evaluated later";
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  if (!value) {
    return "—";
  }
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function renderOutcome(result) {
  const list = document.createElement("dl");
  list.className = "outcome-list";

  Object.entries(outcomeLabels).forEach(([key, label]) => {
    const row = document.createElement("div");
    row.className = "outcome-row";

    const term = document.createElement("dt");
    term.textContent = label;
    const value = document.createElement("dd");
    value.textContent = formatValue(result[key]);

    row.append(term, value);
    list.append(row);
  });

  output.innerHTML = "";
  output.append(list);
}

function updateOutcome() {
  updateVisibility();

  const q1 = getSelectedValue(q1Group, "q1");
  const q2 = getSelectedValue(q2Group, "q2");
  const q3 = getSelectedValue(q3Group, "q3");

  if (!q1) {
    output.textContent = emptyMessage;
    setStatus("Awaiting answers");
    return;
  }

  try {
    const result = window.DecisionModel.evaluateDecision({
      q1,
      q2: q2 || undefined,
      q3: q3 || undefined,
      disruptionTiming: disruptionToggle.checked ? "overnight" : "daytime",
    });
    renderOutcome(result);
    setStatus("Decision ready", "ready");
  } catch (error) {
    output.textContent = error.message;
    setStatus("Missing required input", "error");
  }
}

q1Group.addEventListener("change", updateOutcome);
q2Group.addEventListener("change", updateOutcome);
q3Group.addEventListener("change", updateOutcome);
disruptionToggle.addEventListener("change", updateOutcome);

resetButton.addEventListener("click", () => {
  clearGroup(q1Group);
  clearGroup(q2Group);
  clearGroup(q3Group);
  disruptionToggle.checked = false;
  updateOutcome();
});

updateOutcome();
