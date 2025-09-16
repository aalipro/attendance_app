import { defineStore } from 'pinia';
import { api, handleError } from '../api';

export const useSessionsStore = defineStore('sessions', {
  state: () => ({
    items: [],
    loading: false,
    error: null
  }),
  actions: {
    async fetch(params = {}) {
      this.loading = true;
      try {
        const { data } = await api.get('/sessions', { params });
        this.items = data;
      } catch (e) {
        this.error = handleError(e);
      } finally {
        this.loading = false;
      }
    },
    async create(payload) {
      const { data } = await api.post('/sessions', payload);
      this.items.unshift(data);
      return data;
    },
    async update(id, patch) {
      const { data } = await api.put(`/sessions/${id}`, patch);
      const idx = this.items.findIndex((s) => s.id === id);
      if (idx !== -1) this.items[idx] = data;
      return data;
    },
    async remove(id) {
      await api.delete(`/sessions/${id}`);
      this.items = this.items.filter((s) => s.id !== id);
    },
    async duplicate(id) {
      const { data } = await api.post(`/sessions/${id}/duplicate`);
      this.items.unshift(data);
      return data;
    }
  }
});
