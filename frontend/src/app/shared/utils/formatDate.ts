export const formatIsoDate = (dateStr: string, timeStr: string): string | undefined => {
  if (!dateStr || !dateStr.trim()) return undefined;
  return `${dateStr.trim()}T${timeStr}.000Z`;
};