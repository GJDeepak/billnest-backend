const removeEmptyValues = <T extends object>(data: T): Partial<T> => {
  return Object.fromEntries(
    Object.entries(data).filter(
      ([, value]) =>
        !(typeof value === 'string' && value.trim() === ''),
    ),
  ) as Partial<T>;
};

export { removeEmptyValues };