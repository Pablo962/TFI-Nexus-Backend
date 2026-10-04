import { Injectable, NotFoundException } from '@nestjs/common';
import { PORTER_ACTIVITIES } from '../../data/seed-data.js';
import { PorterActivity } from '../../common/types.js';
import { SimulateDto } from './dto/simulate.dto.js';

@Injectable()
export class PorterService {
  private inMemoryActivities: PorterActivity[] = [...PORTER_ACTIVITIES];

  async findAll() {
    return {
      total: this.inMemoryActivities.length,
      data: this.inMemoryActivities,
    };
  }

  async findOne(id: number) {
    const activity = this.inMemoryActivities.find((a) => a.id === Number(id));
    if (!activity) {
      throw new NotFoundException(`Actividad de Porter con ID ${id} no encontrada`);
    }
    return activity;
  }

  async simulate(simulateDto: SimulateDto) {
    const activity = await this.findOne(simulateDto.activityId);

    // Algoritmo determinístico de proyección
    const deltaHeadcount = simulateDto.headcount - activity.headcount;
    const projectedMarginDelta = +(
      (deltaHeadcount * 0.15 + (simulateDto.budgetK / 100) * 1.2)
    ).toFixed(2);

    const projectedCoverage = Math.min(
      100,
      +(activity.coverage + (deltaHeadcount > 0 ? 4.5 : -3.0)).toFixed(1),
    );

    return {
      message: `Simulación ejecutada: personal reasignado a ${simulateDto.headcount} personas (+${simulateDto.budgetK}k USD). Margen proyectado: +${projectedMarginDelta}% de resultado operativo.`,
      activityId: activity.id,
      activityName: activity.name,
      currentHeadcount: activity.headcount,
      simulatedHeadcount: simulateDto.headcount,
      currentCoverage: `${activity.coverage}%`,
      simulatedCoverage: `${projectedCoverage}%`,
      projectedOperatingMarginDelta: `+${projectedMarginDelta}%`,
      efficiencyStatus: projectedCoverage >= 90 ? 'Óptima' : 'En Riesgo',
    };
  }
}
