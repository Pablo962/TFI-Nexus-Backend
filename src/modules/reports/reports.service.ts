import { Injectable } from '@nestjs/common';
import { ExportService } from '../export/export.service.js';
import { GLOSARIO, ETIQUETAS_DEMANDA } from '../../data/glosario.js';

@Injectable()
export class ReportsService {
  private squadsData = [
    { squad: 'Arquitectura Central', k8s: 98, zeroTrust: 95, distributed: 99, finops: 82, comm: 94, risk: 'Bajo' },
    { squad: 'IA y Aprendizaje Automático', k8s: 90, zeroTrust: 86, distributed: 94, finops: 78, comm: 88, risk: 'Medio' },
    { squad: 'Ingeniería de Datos', k8s: 92, zeroTrust: 90, distributed: 98, finops: 85, comm: 86, risk: 'Bajo' },
    { squad: 'Operaciones y Plataforma', k8s: 99, zeroTrust: 96, distributed: 95, finops: 91, comm: 89, risk: 'Bajo' },
    { squad: 'Ciberseguridad y Accesos', k8s: 88, zeroTrust: 100, distributed: 89, finops: 75, comm: 92, risk: 'Bajo' },
  ];

  constructor(private readonly exportService: ExportService) {}

  async getDashboardKpis(quarter: string = 'Q4 2026') {
    return {
      period: quarter,
      overallEffectiveness: '94.8%',
      averagePerformanceScore: '4.62 / 5.0',
      criticalRolesCovered: '92.4%',
      criticalRolesDetail: '13 de 14 roles con responsable',
      trainingRoi: '3.8x',
      activeHeadcount: 142,
      spofAlertsCount: 1,
      updatedAt: new Date().toISOString(),
    };
  }

  getSquadsHeatmap() {
    return {
      totalSquads: this.squadsData.length,
      data: this.squadsData,
    };
  }

  getSkillsInventory() {
    const inventory = [
      {
        key: 'kubernetes',
        label: GLOSARIO.kubernetes.label,
        technicalName: GLOSARIO.kubernetes.technical,
        count: 34,
        averageLevel: '4.8 / 5.0',
        demand: ETIQUETAS_DEMANDA.criticaAlta,
      },
      {
        key: 'eventos',
        label: GLOSARIO.eventos.label,
        technicalName: GLOSARIO.eventos.technical,
        count: 28,
        averageLevel: '4.7 / 5.0',
        demand: ETIQUETAS_DEMANDA.criticaAlta,
      },
      {
        key: 'seguridadNube',
        label: GLOSARIO.seguridadNube.label,
        technicalName: GLOSARIO.seguridadNube.technical,
        count: 22,
        averageLevel: '4.6 / 5.0',
        demand: ETIQUETAS_DEMANDA.estrategica,
      },
      {
        key: 'ia',
        label: GLOSARIO.ia.label,
        technicalName: GLOSARIO.ia.technical,
        count: 18,
        averageLevel: '4.9 / 5.0',
        demand: ETIQUETAS_DEMANDA.creciente(35),
      },
      {
        key: 'costosNube',
        label: GLOSARIO.costosNube.label,
        technicalName: GLOSARIO.costosNube.technical,
        count: 14,
        averageLevel: '4.2 / 5.0',
        demand: ETIQUETAS_DEMANDA.oportunidadCapacitacion,
      },
    ];

    return {
      totalCompetencies: inventory.length,
      data: inventory,
    };
  }

  async exportReport(format: 'xlsx' | 'csv' | 'pdf' = 'xlsx') {
    if (format === 'pdf') {
      const rows = this.squadsData.map((s) => ({
        label: `${s.squad} (Riesgo: ${s.risk})`,
        value: `K8s: ${s.k8s}% | Zero Trust: ${s.zeroTrust}% | Distribuidos: ${s.distributed}% | FinOps: ${s.finops}%`,
      }));
      const buffer = await this.exportService.generatePdf(
        'Informe Consolidado de Rendimiento de Equipos (Squads)',
        'Resumen de People Analytics para comités ejecutivos y continuidad operacional',
        rows,
      );
      return {
        buffer,
        contentType: 'application/pdf',
        filename: `Reporte_Consolidado_NEXUS_${Date.now()}.pdf`,
      };
    }

    const columns = [
      { header: 'Equipo / Squad', key: 'squad', width: 32 },
      { header: 'Clústeres & K8s (%)', key: 'k8s', width: 22 },
      { header: 'Seguridad Zero Trust (%)', key: 'zeroTrust', width: 25 },
      { header: 'Sistemas Distribuidos (%)', key: 'distributed', width: 25 },
      { header: 'Gestión FinOps (%)', key: 'finops', width: 20 },
      { header: 'Comunicación Ejecutiva (%)', key: 'comm', width: 26 },
      { header: 'Nivel de Riesgo', key: 'risk', width: 18 },
    ];

    if (format === 'csv') {
      const csvCols = columns.map((c) => c.header);
      const csvRows = this.squadsData.map((s) => [
        s.squad,
        `${s.k8s}%`,
        `${s.zeroTrust}%`,
        `${s.distributed}%`,
        `${s.finops}%`,
        `${s.comm}%`,
        s.risk,
      ]);
      return {
        buffer: Buffer.from(this.exportService.generateCsv(csvCols, csvRows)),
        contentType: 'text/csv',
        filename: `Reporte_Squads_NEXUS_${Date.now()}.csv`,
      };
    }

    const buffer = await this.exportService.generateExcel('Rendimiento por Squad', columns, this.squadsData);
    return {
      buffer,
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      filename: `Reporte_Consolidado_NEXUS_${Date.now()}.xlsx`,
    };
  }
}
