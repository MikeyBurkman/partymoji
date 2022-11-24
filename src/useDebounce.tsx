import React from 'react';
import { useDebounceCallback } from '@react-hook/debounce';

const DEFAULT_WAIT = 750;

interface Props<T> {
  initial: T;
  callback: (arg: T) => void;
  waitMillis?: number;
}

export function useDebounce<T>({ initial, callback, waitMillis }: Props<T>) {
  const [val, setVal] = React.useState(initial);
  const onChangeDebounce = useDebounceCallback(
    callback,
    waitMillis ?? DEFAULT_WAIT
  );

  const setDebounced = React.useCallback(
    (arg: T) => {
      setVal(arg);
      onChangeDebounce(arg);
    },
    [onChangeDebounce]
  );

  const setImmediate = React.useCallback(
    (arg: T) => {
      setVal(arg);
      callback(arg);
    },
    [callback]
  );

  return [val, setDebounced, setImmediate] as const;
}
