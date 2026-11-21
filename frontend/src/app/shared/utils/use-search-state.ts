import { signal, WritableSignal } from '@angular/core';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';

export interface SearchStateOptions {
  currentPage?: WritableSignal<number>;
  debounceMs?: number;
}

export function useSearchState(options?: SearchStateOptions) {
  const search = signal('');

  const debouncedSearch = toSignal(
    toObservable(search).pipe(
      debounceTime(options?.debounceMs ?? 350),
      distinctUntilChanged()
    ),
    { initialValue: '' }
  );

  const onSearch = (value: string) => {
    search.set(value);
    if (options?.currentPage) {
      options.currentPage.set(1);
    }
  };

  return {
    search,
    debouncedSearch,
    onSearch,
  };
}