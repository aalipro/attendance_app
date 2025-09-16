import { z } from 'zod';

export const idParam = z.coerce.number().int().positive();

export const classCreateSchema = z.object({
  name: z.string().trim().min(1),
  level: z.string().trim().min(1),
  year: z.coerce.number().int(),
});

export const classUpdateSchema = classCreateSchema.partial();

export const studentCreateSchema = z.object({
  classId: z.coerce.number().int().positive(),
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  email: z.string().email().optional().or(z.literal('').transform(() => undefined)),
  studentNumber: z.string().trim().optional(),
  generalRemark: z.string().optional(),
});

export const studentUpdateSchema = studentCreateSchema.partial();

export const sessionCreateSchema = z.object({
  classId: z.coerce.number().int().positive(),
  subject: z.string().trim().min(1),
  room: z.string().trim().optional(),
  startAt: z.string().min(1),
  endAt: z.string().min(1),
  gradingScaleMin: z.coerce.number().int().optional().default(0),
  gradingScaleMax: z.coerce.number().int().optional().default(20),
  sessionRemark: z.string().optional(),
});

export const sessionUpdateSchema = sessionCreateSchema.partial();

export const attendanceStatusSchema = z.enum(['PRESENT', 'ABSENT', 'RETARD', 'DISPENSE']);

export const setAttendanceSchema = z.object({
  status: attendanceStatusSchema,
});

export const bulkAttendanceSchema = z.object({
  updates: z
    .array(
      z.object({
        studentId: z.coerce.number().int().positive(),
        status: attendanceStatusSchema,
      }),
    )
    .min(1),
});

export const sessionRemarkSchema = z.object({
  text: z.string().trim().default(''),
});

export const studentRemarkSchema = sessionRemarkSchema;

export const setGradeSchema = z.object({
  value: z.coerce.number().min(0),
});
