export class TransactionParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TransactionParseError";
  }
}

export function isTransactionParseError(
  error: unknown,
): error is TransactionParseError {
  return (
    error instanceof TransactionParseError ||
    (error instanceof Error && error.name === "TransactionParseError")
  );
}
