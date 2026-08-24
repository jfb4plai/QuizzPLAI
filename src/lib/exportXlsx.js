/**
 * Builds a one-sheet .xlsx from question-analysis rows (see questionAnalysis.js)
 * and triggers a browser download. Client-side only, nothing is sent to a server.
 *
 * `exceljs` (~1MB) is loaded lazily here rather than imported at the top of the
 * file: this module is reachable from the host report page, and without a dynamic
 * import Vite bundles it into the single shared chunk that every visitor downloads
 * — including participants on `/join/:code`, on their phone, often on school wifi.
 */
export async function downloadQuestionAnalysisXlsx(rows, filename = 'quizzplai-analyse-questions.xlsx') {
  const { default: ExcelJS } = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Par question');

  sheet.columns = [
    { header: 'École', key: 'ecole', width: 24 },
    { header: 'Jeu de questions', key: 'jeu', width: 30 },
    { header: 'Question', key: 'question', width: 60 },
    { header: 'Réponses totales', key: 'total', width: 16 },
    { header: 'Bonnes réponses', key: 'correct', width: 16 },
    { header: 'Mauvaises réponses', key: 'incorrect', width: 18 },
    { header: '% de bonnes réponses', key: 'pctCorrect', width: 20 },
  ];
  sheet.getRow(1).font = { bold: true };
  rows.forEach((row) => sheet.addRow(row));

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
