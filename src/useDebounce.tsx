import React from 'react';
import { useDebounceCallback } from '@react-hook/debounce';

const DEFAULT_WAIT = 750;

interface Props<T> {
  initial: T;
  callback: (arg: T, prev: T) => void;
  waitMillis?: number;
}

export function useDebounce<T>({ initial, callback, waitMillis }: Props<T>) {
  const [val, setVal] = React.useState(initial);
  const lastVal = React.useRef(initial);

  const onChange = React.useCallback(
    (arg: T) => {
      callback(arg, lastVal.current);
      lastVal.current = arg;
    },
    [callback]
  );

  const onChangeDebounce = useDebounceCallback(
    onChange,
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
      onChange(arg);
    },
    [onChange]
  );

  return [val, setDebounced, setImmediate] as const;
}
