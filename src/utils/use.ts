import { getCurrentInstance } from 'vue';

export function useCurrentInstance() {
  const instance = getCurrentInstance();

  if (instance === null) {
    throw new Error('Current Vue Instance is null!');
  }

  return instance;
}
