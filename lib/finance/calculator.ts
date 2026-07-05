export type CalculatorOperator = "+" | "-" | "×" | "÷";

export type CalculatorKey =
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "00"
  | "clear"
  | "backspace"
  | "+"
  | "-"
  | "×"
  | "÷"
  | "=";

export interface CalculatorState {
  /** Digit buffer currently being typed. */
  input: string;
  /** Left-hand value waiting for the next operand. */
  accumulator: number | null;
  operator: CalculatorOperator | null;
  /** Next digit starts a new operand. */
  waitingForOperand: boolean;
  /** Last right-hand operand + operator, for repeat `=`. */
  lastOperand: number | null;
  lastOperator: CalculatorOperator | null;
  error: boolean;
}

const MAX_DIGITS = 12;
const OPERATORS = new Set<CalculatorKey>(["+", "-", "×", "÷"]);

export function createCalculatorState(): CalculatorState {
  return {
    input: "0",
    accumulator: null,
    operator: null,
    waitingForOperand: true,
    lastOperand: null,
    lastOperator: null,
    error: false,
  };
}

function parseInput(input: string): number {
  const value = Number(input);
  return Number.isFinite(value) ? value : 0;
}

function formatInput(value: number): string {
  if (!Number.isFinite(value)) {
    return "0";
  }

  if (Math.abs(value) >= 1e12) {
    return value.toExponential(6);
  }

  if (Number.isInteger(value)) {
    return String(value);
  }

  return String(Number.parseFloat(value.toFixed(8)));
}

function compute(
  left: number,
  operator: CalculatorOperator,
  right: number,
): number | null {
  switch (operator) {
    case "+":
      return left + right;
    case "-":
      return left - right;
    case "×":
      return left * right;
    case "÷":
      if (right === 0) {
        return null;
      }
      return left / right;
  }
}

function currentOperand(state: CalculatorState): number {
  return parseInput(state.input);
}

/** Value shown on screen (pending ops not applied yet). */
export function getCalculatorDisplayValue(state: CalculatorState): number {
  if (state.error) {
    return 0;
  }

  return currentOperand(state);
}

/**
 * Final amount for "Gunakan".
 * Applies any pending operator so `100 + 50` yields 150 without pressing `=`.
 */
export function getCalculatorAmount(state: CalculatorState): number {
  if (state.error) {
    return 0;
  }

  const resolved = resolvePending(state);
  if (resolved.error) {
    return 0;
  }

  return Math.round(currentOperand(resolved));
}

function resolvePending(state: CalculatorState): CalculatorState {
  if (
    state.error ||
    state.accumulator === null ||
    state.operator === null ||
    state.waitingForOperand
  ) {
    return state;
  }

  const result = compute(
    state.accumulator,
    state.operator,
    currentOperand(state),
  );

  if (result === null) {
    return { ...createCalculatorState(), error: true, input: "0" };
  }

  return {
    input: formatInput(result),
    accumulator: null,
    operator: null,
    waitingForOperand: true,
    lastOperand: currentOperand(state),
    lastOperator: state.operator,
    error: false,
  };
}

function appendDigits(input: string, digits: string, replace: boolean): string {
  if (replace || input === "0") {
    if (digits === "00") {
      return "0";
    }

    return digits.replace(/^0+(?=\d)/, "") || "0";
  }

  const next = `${input}${digits}`;
  if (next.replace("-", "").length > MAX_DIGITS) {
    return input;
  }

  return next;
}

function applyDigit(state: CalculatorState, digits: string): CalculatorState {
  if (state.error) {
    return {
      ...createCalculatorState(),
      input: appendDigits("0", digits, true),
      waitingForOperand: false,
    };
  }

  return {
    ...state,
    input: appendDigits(state.input, digits, state.waitingForOperand),
    waitingForOperand: false,
    error: false,
  };
}

function applyOperator(
  state: CalculatorState,
  operator: CalculatorOperator,
): CalculatorState {
  if (state.error) {
    return createCalculatorState();
  }

  // Replace operator when user hasn't typed the next operand yet: `5 + -`
  if (state.waitingForOperand && state.accumulator !== null) {
    return {
      ...state,
      operator,
      lastOperand: null,
      lastOperator: null,
    };
  }

  // Chain: `5 + 3 +` → accumulate 8, wait for next operand
  if (state.accumulator !== null && state.operator !== null) {
    const result = compute(
      state.accumulator,
      state.operator,
      currentOperand(state),
    );

    if (result === null) {
      return { ...createCalculatorState(), error: true };
    }

    return {
      input: formatInput(result),
      accumulator: result,
      operator,
      waitingForOperand: true,
      lastOperand: null,
      lastOperator: null,
      error: false,
    };
  }

  return {
    ...state,
    accumulator: currentOperand(state),
    operator,
    waitingForOperand: true,
    lastOperand: null,
    lastOperator: null,
  };
}

function applyEquals(state: CalculatorState): CalculatorState {
  if (state.error) {
    return createCalculatorState();
  }

  // Repeat last operation: `5 + 3 = =` → 11
  if (
    state.accumulator === null &&
    state.operator === null &&
    state.lastOperator !== null &&
    state.lastOperand !== null
  ) {
    const result = compute(
      currentOperand(state),
      state.lastOperator,
      state.lastOperand,
    );

    if (result === null) {
      return { ...createCalculatorState(), error: true };
    }

    return {
      input: formatInput(result),
      accumulator: null,
      operator: null,
      waitingForOperand: true,
      lastOperand: state.lastOperand,
      lastOperator: state.lastOperator,
      error: false,
    };
  }

  if (state.accumulator === null || state.operator === null) {
    return {
      ...state,
      waitingForOperand: true,
    };
  }

  // `5 + =` uses the left operand as the right operand
  const right = state.waitingForOperand
    ? state.accumulator
    : currentOperand(state);

  const result = compute(state.accumulator, state.operator, right);

  if (result === null) {
    return { ...createCalculatorState(), error: true };
  }

  return {
    input: formatInput(result),
    accumulator: null,
    operator: null,
    waitingForOperand: true,
    lastOperand: right,
    lastOperator: state.operator,
    error: false,
  };
}

function applyBackspace(state: CalculatorState): CalculatorState {
  if (state.error) {
    return createCalculatorState();
  }

  if (state.waitingForOperand) {
    return state;
  }

  const next = state.input.slice(0, -1);

  if (next.length === 0 || next === "-") {
    return {
      ...state,
      input: "0",
      waitingForOperand: true,
    };
  }

  return {
    ...state,
    input: next,
  };
}

export function applyCalculatorKey(
  state: CalculatorState,
  key: CalculatorKey,
): CalculatorState {
  if (key === "clear") {
    return createCalculatorState();
  }

  if (key === "backspace") {
    return applyBackspace(state);
  }

  if (
    key === "0" ||
    key === "1" ||
    key === "2" ||
    key === "3" ||
    key === "4" ||
    key === "5" ||
    key === "6" ||
    key === "7" ||
    key === "8" ||
    key === "9" ||
    key === "00"
  ) {
    return applyDigit(state, key);
  }

  if (OPERATORS.has(key)) {
    return applyOperator(state, key as CalculatorOperator);
  }

  if (key === "=") {
    return applyEquals(state);
  }

  return state;
}

export function formatCalculatorDisplay(value: number | string): string {
  if (typeof value === "string" && value === "Error") {
    return "Error";
  }

  const numeric = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(numeric)) {
    return "0";
  }

  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 8,
  }).format(numeric);
}

export function getCalculatorExpression(state: CalculatorState): string | null {
  if (state.error) {
    return "Tidak bisa dibagi 0";
  }

  if (state.accumulator === null || state.operator === null) {
    return null;
  }

  return `${formatCalculatorDisplay(state.accumulator)} ${state.operator}`;
}

/** Screen text for the main display. */
export function getCalculatorScreen(state: CalculatorState): string {
  if (state.error) {
    return "Error";
  }

  return formatCalculatorDisplay(parseInput(state.input));
}
