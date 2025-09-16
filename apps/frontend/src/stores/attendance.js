import { defineStore } from 'pinia';
import { api } from '../api';
import { useToastStore } from './toast';

function debounce(fn, delay = 350) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

export const useAttendanceStore = defineStore('attendance', {
  state: () => ({
    bySession: {},
    sessionRemark: {},
    saving: false
  }),
  getters: {
    forSession: (s) => (sessionId) => s.bySession[sessionId] || []
  },
  actions: {
    async fetch(sessionId) {
      const { data } = await api.get(`/sessions/${sessionId}/attendance`);
      this.bySession[sessionId] = data;
    },
    setLocalStatus(sessionId, studentId, status) {
      const list = this.bySession[sessionId] || [];
      const row = list.find((r) => r.studentId === studentId);
      if (row) row.status = status;
      this.bySession[sessionId] = [...list];
      this.saveStatus(sessionId, studentId, status);
    },
    setLocalGrade(sessionId, studentId, value) {
      const list = this.bySession[sessionId] || [];
      const row = list.find((r) => r.studentId === studentId);
      if (row) row.grade = value;
      this.bySession[sessionId] = [...list];
      this.saveGrade(sessionId, studentId, value);
    },
    setLocalRemark(sessionId, studentId, text) {
      const list = this.bySession[sessionId] || [];
      const row = list.find((r) => r.studentId === studentId);
      if (row) row.remark = text;
      this.bySession[sessionId] = [...list];
      this.saveStudentRemark(sessionId, studentId, text);
    },
    setLocalSessionRemark(sessionId, text) {
      this.sessionRemark[sessionId] = text;
      this.saveSessionRemark(sessionId, text);
    },
    // Debounced savers
    saveStatus: debounce(async function (sessionId, studentId, status) {
      this.saving = true;
      try {
        await api.put(`/sessions/${sessionId}/attendance/${studentId}`, { status });
        useToastStore().push('Sauvegardé ✔️');
      } finally {
        this.saving = false;
      }
    }),
    saveGrade: debounce(async function (sessionId, studentId, value) {
      this.saving = true;
      try {
        await api.put(`/sessions/${sessionId}/grade/${studentId}`, { value });
        useToastStore().push('Sauvegardé ✔️');
      } finally {
        this.saving = false;
      }
    }),
    async saveGradeNow(sessionId, studentId, value) {
      this.saving = true;
      try {
        await api.put(`/sessions/${sessionId}/grade/${studentId}`, { value });
        useToastStore().push('Note validée ✔️');
      } finally {
        this.saving = false;
      }
    },
    saveStudentRemark: debounce(async function (sessionId, studentId, text) {
      this.saving = true;
      try {
        await api.put(`/sessions/${sessionId}/remark/${studentId}`, { text });
        useToastStore().push('Sauvegardé ✔️');
      } finally {
        this.saving = false;
      }
    }),
    async saveStudentRemarkNow(sessionId, studentId, text) {
      this.saving = true;
      try {
        await api.put(`/sessions/${sessionId}/remark/${studentId}`, { text });
        useToastStore().push('Remarque validée ✔️');
      } finally {
        this.saving = false;
      }
    },
    saveSessionRemark: debounce(async function (sessionId, text) {
      this.saving = true;
      try {
        await api.put(`/sessions/${sessionId}/remark`, { text });
        useToastStore().push('Sauvegardé ✔️');
      } finally {
        this.saving = false;
      }
    }),

    markAllPresent(sessionId) {
      const list = this.bySession[sessionId] || [];
      const updated = list.map((r) => ({ ...r, status: 'PRESENT' }));
      this.bySession[sessionId] = updated;
      useToastStore().push('Tous les élèves marqués présents');
    },

    async bulkSave(sessionId) {
      const list = this.bySession[sessionId] || [];
      const updates = list.map((r) => ({ studentId: r.studentId, status: r.status }));
      this.saving = true;
      try {
        await api.put(`/sessions/${sessionId}/attendance`, { updates });
        useToastStore().push('Présences validées ✔️');
      } finally {
        this.saving = false;
      }
    }
  }
});
