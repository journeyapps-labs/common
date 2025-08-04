export type Newable<T> = (new (...args: never[]) => T) | (abstract new (...args: never[]) => T);

export interface IFactory<T extends any = any> {
  get: () => T;
}

export class CacheFactory<T> implements IFactory<T> {
  cache: T | null;

  constructor(protected cb: () => T) {
    this.cache = null;
  }

  get() {
    if (!this.cache) {
      this.cache = this.cb();
    }
    return this.cache;
  }
}

export interface ContainerOptions {
  /**
   * Use class names as the symbol (requires minified code to preserve class names).
   * Note: When enabled, classes across libraries need to have unique names
   */
  useClassName: boolean;
}

export class Container {
  _mapping: Map<any, IFactory>;

  constructor(protected options: ContainerOptions = { useClassName: true }) {
    this._mapping = new Map<any, IFactory>();
  }

  protected getIdentifier<T>(s: Newable<T>) {
    if (this.options.useClassName) {
      return s.name;
    }
    return s;
  }

  get<T>(s: Newable<T>): T {
    if (!this._mapping.has(this.getIdentifier(s))) {
      throw new Error(`${s.name} not found`);
    }
    return this._mapping.get(this.getIdentifier(s))!.get() as T;
  }

  clear() {
    this._mapping.clear();
  }

  unbind<T>(s: Newable<T>) {
    this._mapping.delete(this.getIdentifier(s));
  }

  bind<T>(s: Newable<T>) {
    if (this._mapping.has(this.getIdentifier(s))) {
      throw new Error(`${s.toString()} is already bound.`);
    }
    return {
      toConstantValue: (instance: T) => {
        this._mapping.set(this.getIdentifier(s), {
          get: () => instance
        });
      }
    };
  }

  bindFactory<T>(s: Newable<T>, cb: () => T) {
    // @ts-ignore
    this.bind(s).toConstantValue(new CacheFactory(cb));
  }

  bindConstant<T>(s: Newable<T>, instance: T) {
    this.bind(s).toConstantValue(instance);
  }
}

export const createDecorator = (container: Container) => {
  return <T>(s: Newable<T>) => {
    return <C, V>(
      target: any,
      ctx: ClassAccessorDecoratorContext<C, V>
    ): ClassAccessorDecoratorResult<C, any> | undefined => {
      if (ctx.kind === 'accessor') {
        return {
          get() {
            return container.get(s);
          },
          set(value: T) {},
          init(value: T): T {
            return value;
          }
        };
      }
    };
  };
};
