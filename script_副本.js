(() => {
  const display = document.getElementById("display");
  const keys = document.querySelector(".keys");

  let current = "0";
  let previous = null;
  let operator = null;
  let justEvaluated = false;

  function updateDisplay() {
    display.textContent = current;
  }

  function inputDigit(digit) {
    if (justEvaluated) {
      current = digit;
      justEvaluated = false;
      return;
    }

    if (current === "0") {
      current = digit;
    } else if (current === "-0") {
      current = "-" + digit;
    } else {
      current += digit;
    }
  }

  function inputDecimal() {
    if (justEvaluated) {
      current = "0.";
      justEvaluated = false;
      return;
    }

    if (!current.includes(".")) {
      current += ".";
    }
  }

  function toggleSign() {
    if (current === "0") return;
    current = current.startsWith("-") ? current.slice(1) : "-" + current;
  }

  function percent() {
    const value = parseFloat(current);
    if (Number.isNaN(value)) return;
    current = formatNumber(value / 100);
  }

  function clearAll() {
    current = "0";
    previous = null;
    operator = null;
    justEvaluated = false;
  }

  function setOperator(nextOperator) {
    const value = parseFloat(current);

    if (previous !== null && operator && !justEvaluated) {
      previous = compute(previous, value, operator);
      current = formatNumber(previous);
    } else {
      previous = value;
    }

    operator = nextOperator;
    justEvaluated = true;
  }

  function equals() {
    if (operator === null || previous === null) return;

    const value = parseFloat(current);
    const result = compute(previous, value, operator);
    current = formatNumber(result);
    previous = null;
    operator = null;
    justEvaluated = true;
  }

  function compute(a, b, op) {
    switch (op) {
      case "+":
        return a + b;
      case "-":
        return a - b;
      case "*":
        return a * b;
      case "/":
        return b === 0 ? NaN : a / b;
      default:
        return b;
    }
  }

  function formatNumber(num) {
    if (Number.isNaN(num) || !Number.isFinite(num)) {
      return "错误";
    }

    const rounded = Math.round(num * 1e10) / 1e10;
    let text = String(rounded);

    if (text.length > 12) {
      text = rounded.toPrecision(10).replace(/\.?0+e/, "e");
    }

    return text;
  }

  keys.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const action = button.dataset.action;
    const value = button.dataset.value;

    switch (action) {
      case "digit":
        inputDigit(value);
        break;
      case "decimal":
        inputDecimal();
        break;
      case "operator":
        setOperator(value);
        break;
      case "equals":
        equals();
        break;
      case "clear":
        clearAll();
        break;
      case "sign":
        toggleSign();
        break;
      case "percent":
        percent();
        break;
      default:
        break;
    }

    updateDisplay();
  });

  document.addEventListener("keydown", (event) => {
    const { key } = event;

    if (/^\d$/.test(key)) {
      inputDigit(key);
      updateDisplay();
      flashKey(`[data-action="digit"][data-value="${key}"]`);
      return;
    }

    if (key === ".") {
      inputDecimal();
      updateDisplay();
      flashKey('[data-action="decimal"]');
      return;
    }

    if (key === "+" || key === "-" || key === "*" || key === "/") {
      setOperator(key);
      updateDisplay();
      flashKey(`[data-action="operator"][data-value="${key}"]`);
      return;
    }

    if (key === "Enter" || key === "=") {
      event.preventDefault();
      equals();
      updateDisplay();
      flashKey('[data-action="equals"]');
      return;
    }

    if (key === "Escape" || key === "c" || key === "C") {
      clearAll();
      updateDisplay();
      flashKey('[data-action="clear"]');
      return;
    }

    if (key === "%") {
      percent();
      updateDisplay();
      flashKey('[data-action="percent"]');
    }
  });

  function flashKey(selector) {
    const button = document.querySelector(selector);
    if (!button) return;
    button.classList.add("is-pressed");
    setTimeout(() => button.classList.remove("is-pressed"), 120);
  }

  updateDisplay();
})();
