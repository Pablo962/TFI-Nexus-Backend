import { Injectable } from '@nestjs/common';
import ExcelJS from 'exceljs';
import { stringify } from 'csv-stringify/sync';
import PDFDocument from 'pdfkit';

@Injectable()
export class ExportService {
  /**
   * Genera un archivo Excel (.xlsx) en memoria a partir de columnas y filas.
   */
  async generateExcel(
    sheetName: string,
    columns: Array<{ header: string; key: string; width?: number }>,
    data: any[],
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'NEXUS People Analytics';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet(sheetName);
    sheet.columns = columns.map((col) => ({
      header: col.header,
      key: col.key,
      width: col.width || 20,
    }));

    // Estilo para el encabezado
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF630ED4' }, // Morado NEXUS
    };

    // Agregar las filas
    data.forEach((row) => sheet.addRow(row));

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Genera un archivo CSV en memoria a partir de columnas y filas.
   */
  generateCsv(columns: string[], data: any[][]): string {
    return stringify([columns, ...data]);
  }

  /**
   * Genera un archivo PDF (.pdf) formal en memoria.
   */
  async generatePdf(
    title: string,
    subtitle: string,
    rows: Array<{ label: string; value: string }>,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err: Error) => reject(err));

      // Header Banner NEXUS
      doc.rect(40, 40, 515, 60).fill('#630ED4');
      doc.fillColor('#FFFFFF').fontSize(20).text('NEXUS · People Analytics', 55, 52);
      doc.fontSize(10).text('Plataforma Integral de Inteligencia de Capital Humano', 55, 76);

      doc.moveDown(3);
      doc.fillColor('#131B2E').fontSize(16).text(title, 40, 120);
      doc.fontSize(10).fillColor('#7B7487').text(subtitle, 40, 142);
      doc.text(
        `Fecha de emisión: ${new Date().toLocaleDateString('es-AR')} ${new Date().toLocaleTimeString('es-AR')}`,
        40,
        156,
      );

      // Tabla de Contenido
      let y = 185;
      doc.rect(40, y, 515, 24).fill('#F2F3FF');
      doc.fillColor('#25005A').fontSize(10).text('CONCEPTO / INDICADOR', 50, y + 7);
      doc.text('VALOR / DETALLE', 320, y + 7);

      y += 26;
      rows.forEach((r, idx) => {
        if (y > 750) {
          doc.addPage();
          y = 50;
        }
        if (idx % 2 === 0) {
          doc.rect(40, y, 515, 22).fill('#FAFAFC');
        }
        doc.fillColor('#131B2E').fontSize(9).text(r.label, 50, y + 6, { width: 260 });
        doc.fillColor('#25005A').font('Helvetica-Bold').text(r.value, 320, y + 6, { width: 225 });
        doc.font('Helvetica');
        y += 24;
      });

      // Footer
      doc.fillColor('#7B7487').fontSize(8).text(
        'Documento oficial generado por NEXUS. Confidencialidad y gobernanza de datos asegurada.',
        40,
        780,
        { align: 'center', width: 515 },
      );

      doc.end();
    });
  }
}
