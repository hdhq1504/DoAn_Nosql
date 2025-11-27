export const generateNextId = (list, prefix, digitLength) => {
  if (!list || list.length === 0) {
    return `${prefix}${String(1).padStart(digitLength, '0')}`;
  }

  const ids = list
    .map(item => item.id)
    .filter(id => id && id.startsWith(prefix));

  if (ids.length === 0) {
    return `${prefix}${String(1).padStart(digitLength, '0')}`;
  }

  const maxId = ids.reduce((max, id) => {
    const numPartStr = id.slice(prefix.length);
    const numPart = parseInt(numPartStr, 10);
    return !isNaN(numPart) && numPart > max ? numPart : max;
  }, 0);

  return `${prefix}${String(maxId + 1).padStart(digitLength, '0')}`;
};
