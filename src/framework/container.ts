type Constructor<T = any> = new (...args: any[]) => T;

interface Provider<T = any> {
  useClass: Constructor<T>;
  dependencies?: string[];
  singleton?: boolean;
  instance?: T;
}

export class Container {
  private static instance: Container;

  private providers = new Map<string, Provider>();

  private constructor() {}

  public static getInstance(): Container {
    if (!this.instance) {
      this.instance = new Container();
    }
    return this.instance;
  }

  public register<T>(token: string, provider: Provider<T>): void {
    this.providers.set(token, provider);
  }

  public get<T>(token: string): T {
    const provider = this.providers.get(token);

    if (!provider) {
      throw new Error(`Provider ${token} not found.`);
    }

    if (provider.singleton && provider.instance) {
      return provider.instance;
    }

    const dependencies = provider.dependencies || [];
    const args = dependencies.map((token) => this.get(token));
    const instance = new provider.useClass(...args);

    if (provider.singleton) {
      provider.instance = instance;
    }

    return instance;
  }
}
