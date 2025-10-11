declare module 'leo-profanity' {
  interface LeoProfanity {
    check(text: string): boolean;
    clean(text: string): string;
    add(words: string | string[]): void;
    remove(words: string | string[]): void;
    clearList(): void;
    list(): string[];
  }

  const leoProfanity: LeoProfanity;
  export default leoProfanity;
}
