export const useDebounce = (func: (...args: any[]) => void, timeout: number = 300) => {
  let timeoutId: any;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, timeout);
  };
}