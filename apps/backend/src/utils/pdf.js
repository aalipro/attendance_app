import PDFDocument from 'pdfkit';
import stream from 'stream';

export function buildSessionPdf({ establishment = 'Établissement', classe, date, subject, room, students }) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  const pass = new stream.PassThrough();

  doc.pipe(pass);
  doc.fontSize(16).text(`${establishment}`, { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(14).text(`Feuille d'appel`, { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(12).text(`Classe: ${classe} | Date: ${date}`);
  doc.text(`Matière: ${subject}${room ? ' | Salle: ' + room : ''}`);
  doc.moveDown(1);

  doc.fontSize(11).text("Élèves:", { underline: true });
  doc.moveDown(0.5);

  students.forEach((s, i) => {
    doc.text(`${i + 1}. ${s.lastName.toUpperCase()} ${s.firstName}  .............. Signature:`);
  });

  doc.moveDown(2);
  doc.text('Signature professeur: ___________________________');

  doc.end();
  return pass;
}
