import { action, computed, makeObservable, observable, toJS } from 'mobx';
import toast from 'react-hot-toast';
import type { z, ZodSchema } from 'zod';

/**
 * Builds an Entity base class with the Zod schema closed over.
 * Subclasses inherit the typed constructor — use `init()` instead of
 * overriding `constructor` when you need extra setup (e.g. makeObservable).
 *
 * @example
 * class UserModel extends createEntity(UserSchema) {
 *   protected init() {
 *     makeObservable(this, { username: computed });
 *   }
 *   get username() { return this.data.username; }
 * }
 */
export function createEntity<S extends ZodSchema>(schema: S) {
  type Data = z.infer<S>;

  class Entity {
    schema: S = schema;
    data: Data;
    history: Data[] = [];
    historyIndex = -1;

    constructor(data: Data) {
      this.data = data;
      try {
        this.history = [structuredClone(toJS(data))];
      } catch {
        // API payloads can include non-cloneable values; keep a shallow snapshot.
        this.history = [{ ...(data as object) } as Data];
      }
      this.historyIndex = 0;

      makeObservable(this, {
        schema: false,
        data: observable,
        // Shallow: deep observable history entries cannot be structuredClone'd on undo/redo.
        history: observable.shallow,
        historyIndex: observable,
        canUndo: computed,
        canRedo: computed,
        update: action,
        undo: action,
        redo: action,
        clearRedo: action,
      });

      this.validate(data);
      this.init();
    }

    /** Override for subclass MobX annotations / post-construct setup. */
    protected init(): void {}

    private validate = (data: Data) => {
      return this.schema.safeParse(data);
    };

    get canUndo() {
      return this.historyIndex > 0;
    }

    get canRedo() {
      return this.historyIndex < this.history.length - 1;
    }

    private cloneData = (data: Data): Data => structuredClone(toJS(data));

    update = (data: Data, options?: { skipHistory?: boolean }) => {
      const validation = this.validate(data);

      if (!validation.success) {
        toast.error('Cannot update entity');

        return;
      }

      if (options?.skipHistory) {
        this.data = data;

        if (this.historyIndex >= 0) {
          const nextHistory = this.history.slice();
          nextHistory[this.historyIndex] = this.cloneData(data);
          this.history = nextHistory;
        }

        return;
      }

      this.history = [...this.history.slice(0, this.historyIndex + 1), this.cloneData(data)];
      this.historyIndex = this.history.length - 1;
      this.data = data;
    };

    /** Restore previous history snapshot. Returns restored data, or null if nothing to undo. */
    undo = (): Data | null => {
      if (!this.canUndo) return null;

      this.historyIndex -= 1;
      this.data = this.cloneData(this.history[this.historyIndex]);

      return this.data;
    };

    /** Restore next history snapshot. Returns restored data, or null if nothing to redo. */
    redo = (): Data | null => {
      if (!this.canRedo) return null;

      this.historyIndex += 1;
      this.data = this.cloneData(this.history[this.historyIndex]);

      return this.data;
    };

    /** Drop any redo branch after the current index. */
    clearRedo = () => {
      this.history = this.history.slice(0, this.historyIndex + 1);
    };
  }

  return Entity;
}
