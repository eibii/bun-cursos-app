export class ConflictError extends Error {
  constructor(public message: string) {
    super(message);
  }
}
