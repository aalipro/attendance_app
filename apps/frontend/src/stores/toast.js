import { defineStore } from 'pinia';

export const useToastStore = defineStore('toast', {
  state: () => ({
    items: []
  }),
  actions: {
    push(message, kind = 'success') {
      const id = Date.now() + Math.random();
      this.items.push({ id, message, kind });
      setTimeout(() => this.remove(id), 2000);
    },
    remove(id) {
      this.items = this.items.filter((t) => t.id !== id);
    }
  }
});
