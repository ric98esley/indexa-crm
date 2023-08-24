export const useDebounce = (func: (...args: any[]) => void, timeout: number = 300) => {
  let timeoutId: number;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, timeout);
  };
}