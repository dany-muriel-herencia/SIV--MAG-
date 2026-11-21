import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs/operators';
import { Signal } from '@angular/core';

export function useDebouncedSignal<T>(source: Signal<T>, timeMs = 300): Signal<T> {
  return toSignal(toObservable(source).pipe(debounceTime(timeMs)), {
    initialValue: source(),
  });
}
