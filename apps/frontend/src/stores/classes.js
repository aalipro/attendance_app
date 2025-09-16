import { defineStore } from 'pinia';
import { api, handleError } from '../api';

export const useClassesStore = defineStore('classes', {
  state: () => ({
    items: [],
    loading: false,
    error: null
  }),
  actions: {
    async fetch() {
      this.loading = true;
      try {
        const { data } = await api.get('/classes');
        this.items = data;
      } catch (e) {
        this.error = handleError(e);
      } finally {
        this.loading = false;
      }
    },
    async create(payload) {
      const { data } = await api.post('/classes', payload);
      this.items.push(data);
      return data;
    },
    async update(id, patch) {
      const { data } = await api.put(`/classes/${id}`, patch);
      const idx = this.items.findIndex((c) => c.id === id);
      if (idx !== -1) this.items[idx] = data;
      return data;
    },
    async remove(id) {
      await api.delete(`/classes/${id}`);
      this.items = this.items.filter((c) => c.id !== id);
    }
  }
});
