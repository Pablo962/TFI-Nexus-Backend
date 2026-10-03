import { Injectable } from '@nestjs/common';
import ExcelJS from 'exceljs';
import { stringify } from 'csv-stringify/sync';

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
}
