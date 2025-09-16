import { defineStore } from 'pinia';
import { api, handleError } from '../api';

export const useStudentsStore = defineStore('students', {
  state: () => ({
    byClass: {},
    loading: false,
    error: null
  }),
  getters: {
    forClass: (s) => (classId) => s.byClass[classId] || []
  },
  actions: {
    async fetchByClass(classId) {
      this.loading = true;
      try {
        const { data } = await api.get('/students', { params: { classId } });
        this.byClass[classId] = data;
      } catch (e) {
        this.error = handleError(e);
      } finally {
        this.loading = false;
      }
    },
    async create(payload) {
      const { data } = await api.post('/students', payload);
      const list = this.byClass[payload.classId] || [];
      list.push(data);
      this.byClass[payload.classId] = list;
      return data;
    },
    async update(id, patch) {
      const { data } = await api.put(`/students/${id}`, patch);
      const classId = data.classId;
      const list = this.byClass[classId] || [];
      const idx = list.findIndex((s) => s.id === id);
      if (idx !== -1) list[idx] = data;
      this.byClass[classId] = list;
      return data;
    },
    async remove(id, classId) {
      await api.delete(`/students/${id}`);
      this.byClass[classId] = (this.byClass[classId] || []).filter((s) => s.id !== id);
    },
    async importCsv(classId, csv) {
      const { data } = await api.post('/students/import', { csv }, { params: { classId } });
      return data;
    },
    async exportCsv(classId) {
      const res = await api.get('/students/export', {
        params: { classId },
        responseType: 'blob'
      });
      return res.data;
    }
  }
});
