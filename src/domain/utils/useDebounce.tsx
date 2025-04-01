import React from 'react';

interface Props<T> {
  value: T;
  debounceMillis?: number;
  onChange: (newValue: T) => void;
}

export function useDebounce<T>({
  value,
  debounceMillis,
  onChange,
}: Props<T>): [T, (newT: T) => void] {
  const [v, setV] = React.useState<T>(value);
  const debounceRef = React.useRef<NodeJS.Timeout>(null);
  const onValueChange = React.useCallback(
    (newV: T) => {
      setV(newV);
      if (debounceRef.current != null) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        onChange(newV);
      }, debounceMillis ?? 200);
    },
    [debounceMillis, onChange],
  );

  React.useEffect(() => {
    // Listen to external changes to value
    setV(value);
  }, [value]);

  return [v, onValueChange];
}
