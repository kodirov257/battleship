export interface Repository<T> {
  all(): T[];
  create(...args: any[]): T;
  find(...args: any[]): T | undefined;
  update(...args: any[]): T;
  remove(...args: any[]): boolean;
}
