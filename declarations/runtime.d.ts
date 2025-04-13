interface ObjectConstructor {
  groupBy<K extends PropertyKey, T>(
    items: Iterable<T>,
    keySelector: (item: T, index: number) => K,
  ): Partial<Record<K, T[]>>;
}

interface MapConstructor {
  groupBy<K, T>(
    items: Iterable<T>,
    keySelector: (item: T, index: number) => K,
  ): Map<K, T[]>;
}
