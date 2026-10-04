import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';

import {
  JOB_POSITIONS,
  EMPLOYEES_DATA,
  TALENT_PERSONS,
  CANDIDATES_DATA,
  INITIAL_USERS,
  INITIAL_TRACKS,
  INITIAL_EVALUATIONS,
  PORTER_ACTIVITIES,
  UNIDADES_DATA,
  COMPETENCIAS_DATA,
} from '../src/data/seed-data.js';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is missing.');
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const getJobId = (code: string) => {
  const map: Record<string, string> = {
    'PUE-2026-ARCH-03': 'pue-arch-03',
    'PUE-2026-ENG-08': 'pue-eng-08',
    'PUE-2026-SEC-01': 'pue-sec-01',
    'PUE-2026-DAT-04': 'pue-dat-04',
    'PUE-DIR-INFO-01': 'pue-dir-info-01',
    'PUE-JEF-PROC-02': 'pue-jef-proc-02',
    'PUE-DIG-PART-05': 'pue-dig-part-05',
    'PUE-ESC-PART-06': 'pue-esc-part-06',
    'PUE-REC-PART-07': 'pue-rec-part-07',
    'PUE-PRG-ANAL-08': 'pue-prg-anal-08',
    'PUE-TEC-SOP-09': 'pue-tec-sop-09',
  };
  return map[code] || code.toLowerCase().replace(/[^a-z0-9]/g, '-');
};

async function main() {
  console.log('🌱 Iniciando carga de datos iniciales en Supabase (TFI-NEXUS)...');

  // 1. Unidades Organizacionales (12 Tablas - Word)
  console.log('  -> Creando unidades organizacionales (Unidad)...');
  for (const u of UNIDADES_DATA.filter((x) => !x.idUnidadSuperior)) {
    await prisma.unidad.upsert({
      where: { id: u.id },
      update: { nombre: u.nombre, idUnidadSuperior: null },
      create: { id: u.id, nombre: u.nombre, idUnidadSuperior: null },
    });
  }
  for (const u of UNIDADES_DATA.filter((x) => x.idUnidadSuperior)) {
    await prisma.unidad.upsert({
      where: { id: u.id },
      update: { nombre: u.nombre, idUnidadSuperior: u.idUnidadSuperior },
      create: { id: u.id, nombre: u.nombre, idUnidadSuperior: u.idUnidadSuperior },
    });
  }
  console.log(`     ✓ ${UNIDADES_DATA.length} unidades organizacionales cargadas.`);

  // 2. Competencias (12 Tablas - Word)
  console.log('  -> Creando catálogo de competencias (Competencia)...');
  for (const c of COMPETENCIAS_DATA) {
    await prisma.competencia.upsert({
      where: { id: c.id },
      update: { descripcion: c.descripcion, tipo: c.tipo },
      create: { id: c.id, descripcion: c.descripcion, tipo: c.tipo },
    });
  }
  console.log(`     ✓ ${COMPETENCIAS_DATA.length} competencias cargadas.`);

  // 3. Job Positions (Perfiles de Puesto - Word y Nexus)
  console.log('  -> Creando perfiles de puesto (JobPosition)...');
  for (const job of JOB_POSITIONS) {
    const id = getJobId(job.code);

    await prisma.jobPosition.upsert({
      where: { code: job.code },
      update: {
        title: job.title,
        department: job.department,
        status: job.status as 'critical' | 'operational',
        activeIncumbentsCount: job.activeIncumbentsCount,
        complianceRate: job.complianceRate,
        division: job.division,
        reportsTo: job.reportsTo,
        supervises: job.supervises,
        salaryBand: job.salaryBand,
        mission: job.mission,
        proposito: job.proposito ?? job.mission,
        nPosiciones: job.nPosiciones ?? 1,
        idUnidad: job.idUnidad ?? null,
        purposeLink: job.purposeLink,
        internalRelations: job.internalRelations,
        externalRelations: job.externalRelations,
        formalAuthority: job.formalAuthority,
        workingConditions: (job.workingConditions as any) ?? null,
        responsibilities: (job.responsibilities as any) ?? null,
        techSkills: (job.techSkills as any) ?? null,
        softSkills: (job.softSkills as any) ?? null,
      },
      create: {
        id,
        code: job.code,
        title: job.title,
        department: job.department,
        status: job.status as 'critical' | 'operational',
        activeIncumbentsCount: job.activeIncumbentsCount,
        complianceRate: job.complianceRate,
        division: job.division,
        reportsTo: job.reportsTo,
        supervises: job.supervises,
        salaryBand: job.salaryBand,
        mission: job.mission,
        proposito: job.proposito ?? job.mission,
        nPosiciones: job.nPosiciones ?? 1,
        idUnidad: job.idUnidad ?? null,
        purposeLink: job.purposeLink,
        internalRelations: job.internalRelations,
        externalRelations: job.externalRelations,
        formalAuthority: job.formalAuthority,
        workingConditions: (job.workingConditions as any) ?? null,
        responsibilities: (job.responsibilities as any) ?? null,
        techSkills: (job.techSkills as any) ?? null,
        softSkills: (job.softSkills as any) ?? null,
      },
    });
  }

  // Actualizar relaciones jerárquicas recursivas de Puesto Superior (Word)
  for (const job of JOB_POSITIONS) {
    if (job.idPuestoSuperior) {
      const superiorId = getJobId(job.idPuestoSuperior);
      await prisma.jobPosition.update({
        where: { code: job.code },
        data: { idPuestoSuperior: superiorId },
      });
    }
  }

  // 4. Tablas Normalizadas Hijas de Puesto (12 Tablas - Word)
  console.log('  -> Cargando entidades relacionales del Word (Perfil, Funciones, Tareas, etc.)...');
  for (const job of JOB_POSITIONS) {
    const id = getJobId(job.code);

    // Perfil y PerfilCompetencia (1:1 y N:M)
    if (job.perfil) {
      await prisma.perfil.upsert({
        where: { idPuesto: id },
        update: {
          educacionFormal: job.perfil.educacionFormal,
          experienciaRequerida: job.perfil.experienciaRequerida,
        },
        create: {
          idPuesto: id,
          educacionFormal: job.perfil.educacionFormal,
          experienciaRequerida: job.perfil.experienciaRequerida,
        },
      });

      if (job.perfil.competencias && job.perfil.competencias.length > 0) {
        for (const comp of job.perfil.competencias) {
          await prisma.perfilCompetencia.upsert({
            where: {
              idPuesto_idCompetencia: {
                idPuesto: id,
                idCompetencia: comp.id,
              },
            },
            update: {},
            create: {
              idPuesto: id,
              idCompetencia: comp.id,
            },
          });
        }
      }
    }

    // Responsabilidad (1:1)
    if (job.responsabilidadFicha) {
      await prisma.responsabilidad.upsert({
        where: { idPuesto: id },
        update: {
          manejoPersonal: job.responsabilidadFicha.manejoPersonal ?? null,
          equipoTrabajo: job.responsabilidadFicha.equipoTrabajo ?? null,
          manejoInformacion: job.responsabilidadFicha.manejoInformacion ?? null,
        },
        create: {
          idPuesto: id,
          manejoPersonal: job.responsabilidadFicha.manejoPersonal ?? null,
          equipoTrabajo: job.responsabilidadFicha.equipoTrabajo ?? null,
          manejoInformacion: job.responsabilidadFicha.manejoInformacion ?? null,
        },
      });
    }

    // Condiciones de Trabajo (1:N)
    if (job.condicionesTrabajoLista && job.condicionesTrabajoLista.length > 0) {
      for (const cond of job.condicionesTrabajoLista) {
        await prisma.condicionTrabajo.upsert({
          where: { id: cond.id },
          update: { descripcion: cond.descripcion, idPuesto: id },
          create: { id: cond.id, descripcion: cond.descripcion, idPuesto: id },
        });
      }
    }

    // Riesgos de Puesto (1:N)
    if (job.riesgosPuesto && job.riesgosPuesto.length > 0) {
      for (const r of job.riesgosPuesto) {
        await prisma.riesgoPuesto.upsert({
          where: { id: r.id },
          update: {
            tipoRiesgo: r.tipoRiesgo,
            motivo: r.motivo,
            consecuencia: r.consecuencia,
            idPuesto: id,
          },
          create: {
            id: r.id,
            tipoRiesgo: r.tipoRiesgo,
            motivo: r.motivo,
            consecuencia: r.consecuencia,
            idPuesto: id,
          },
        });
      }
    }

    // Relaciones de Puesto (1:N)
    if (job.relacionesPuesto && job.relacionesPuesto.length > 0) {
      for (const rel of job.relacionesPuesto) {
        await prisma.relacionPuesto.upsert({
          where: { id: rel.id },
          update: {
            tipo: rel.tipo,
            puestoOInstitucion: rel.puestoOInstitucion,
            unidad: rel.unidad ?? null,
            proposito: rel.proposito,
            idPuesto: id,
          },
          create: {
            id: rel.id,
            tipo: rel.tipo,
            puestoOInstitucion: rel.puestoOInstitucion,
            unidad: rel.unidad ?? null,
            proposito: rel.proposito,
            idPuesto: id,
          },
        });
      }
    }

    // Estándares de Desempeño (1:N)
    if (job.estandaresDesempeno && job.estandaresDesempeno.length > 0) {
      for (const est of job.estandaresDesempeno) {
        await prisma.estandarDesempeno.upsert({
          where: { id: est.id },
          update: { descripcion: est.descripcion, idPuesto: id },
          create: { id: est.id, descripcion: est.descripcion, idPuesto: id },
        });
      }
    }

    // Funciones y Tareas (1:N y 1:N)
    if (job.funciones && job.funciones.length > 0) {
      for (const func of job.funciones) {
        await prisma.funcion.upsert({
          where: { id: func.id },
          update: { descripcion: func.descripcion, idPuesto: id },
          create: { id: func.id, descripcion: func.descripcion, idPuesto: id },
        });

        if (func.tareas && func.tareas.length > 0) {
          for (const tar of func.tareas) {
            await prisma.tarea.upsert({
              where: { id: tar.id },
              update: { descripcion: tar.descripcion, idFuncion: func.id },
              create: { id: tar.id, descripcion: tar.descripcion, idFuncion: func.id },
            });
          }
        }
      }
    }
  }
  console.log(`     ✓ ${JOB_POSITIONS.length} puestos y sus estructuras relacionales cargados.`);

  // 2. Employees (Colaboradores / Legajos)
  console.log('  -> Creando colaboradores (Employee)...');
  for (const emp of EMPLOYEES_DATA) {
    const talent = TALENT_PERSONS.find((t) => t.id === emp.id);
    const jobPositionId =
      emp.id === 'lucas'
        ? 'pue-arch-03'
        : emp.id === 'sofia'
          ? 'pue-eng-08'
          : emp.id === 'carlos'
            ? 'pue-sec-01'
            : null;

    const risk = (talent?.riskStatus as 'optimal' | 'moderate' | 'spof') || 'optimal';

    await prisma.employee.upsert({
      where: { empId: emp.empId },
      update: {
        name: emp.name,
        email: emp.email,
        phone: emp.phone ?? null,
        role: emp.role,
        area: emp.area,
        tenure: emp.tenure,
        contract: emp.contract,
        location: emp.location,
        salaryBand: emp.salaryBand,
        percentile: emp.percentile,
        avatar: emp.avatar,
        supervisorName: emp.supervisor?.name || 'Dirección de Talento',
        supervisorRole: emp.supervisor?.role || 'Directora Ejecutiva',
        supervisorAvatar:
          emp.supervisor?.avatar ||
          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
        roleMatch: emp.roleMatch ?? 90,
        gFactor: emp.gFactor ?? 1.0,
        status: emp.status ?? 'Óptimo',
        badge: emp.badge ?? 'Referente Técnico',
        criticality: talent?.criticality ?? 8.5,
        riskStatus: risk,
        spectrumSkills: (emp.spectrumSkills as any) ?? null,
        hardSkills: (emp.hardSkills as any) ?? null,
        softSkills: (emp.softSkills as any) ?? null,
        recommendedTraining: (emp.recommendedTraining as any) ?? null,
        reviews: (emp.reviews as any) ?? null,
        projects: (emp.projects as any) ?? null,
        jobPositionId,
      },
      create: {
        id: emp.id,
        empId: emp.empId,
        name: emp.name,
        email: emp.email,
        phone: emp.phone ?? null,
        role: emp.role,
        area: emp.area,
        tenure: emp.tenure,
        contract: emp.contract,
        location: emp.location,
        salaryBand: emp.salaryBand,
        percentile: emp.percentile,
        avatar: emp.avatar,
        supervisorName: emp.supervisor?.name || 'Dirección de Talento',
        supervisorRole: emp.supervisor?.role || 'Directora Ejecutiva',
        supervisorAvatar:
          emp.supervisor?.avatar ||
          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
        roleMatch: emp.roleMatch ?? 90,
        gFactor: emp.gFactor ?? 1.0,
        status: emp.status ?? 'Óptimo',
        badge: emp.badge ?? 'Referente Técnico',
        criticality: talent?.criticality ?? 8.5,
        riskStatus: risk,
        spectrumSkills: (emp.spectrumSkills as any) ?? null,
        hardSkills: (emp.hardSkills as any) ?? null,
        softSkills: (emp.softSkills as any) ?? null,
        recommendedTraining: (emp.recommendedTraining as any) ?? null,
        reviews: (emp.reviews as any) ?? null,
        projects: (emp.projects as any) ?? null,
        jobPositionId,
      },
    });
  }
  console.log(`     ✓ ${EMPLOYEES_DATA.length} colaboradores cargados.`);

  // 3. Candidates (Tabla 'candidatos' en Supabase)
  console.log('  -> Creando candidatos (Candidate -> tabla candidatos)...');
  for (const cand of CANDIDATES_DATA) {
    await prisma.candidate.upsert({
      where: { id: cand.id },
      update: {
        rank: cand.rank,
        name: cand.name,
        title: cand.title,
        experience: cand.experience,
        avatar: cand.avatar,
        matchScore: cand.matchScore,
        matchLabel: cand.matchLabel,
        techScore: cand.techScore,
        softScore: cand.softScore,
        strengths: cand.strengths,
        stage: (cand as any).stage || 'Revisión Inicial',
        notes: (cand as any).notes || null,
        radarScores: (cand.radarScores as any) ?? null,
        jobPositionId: 'pue-arch-03',
      },
      create: {
        id: cand.id,
        rank: cand.rank,
        name: cand.name,
        title: cand.title,
        experience: cand.experience,
        avatar: cand.avatar,
        matchScore: cand.matchScore,
        matchLabel: cand.matchLabel,
        techScore: cand.techScore,
        softScore: cand.softScore,
        strengths: cand.strengths,
        stage: (cand as any).stage || 'Revisión Inicial',
        notes: (cand as any).notes || null,
        radarScores: (cand.radarScores as any) ?? null,
        jobPositionId: 'pue-arch-03',
      },
    });
  }
  console.log(`     ✓ ${CANDIDATES_DATA.length} candidatos cargados en tabla 'candidatos'.`);

  // 4. Evaluations (Evaluaciones 9-Box y Desempeño 360)
  console.log('  -> Creando evaluaciones de talento (Evaluation)...');
  for (const evalItem of INITIAL_EVALUATIONS) {
    const jobPositionId =
      evalItem.jobPositionId ||
      (evalItem.employeeId === 'lucas'
        ? 'pue-arch-03'
        : evalItem.employeeId === 'sofia'
          ? 'pue-eng-08'
          : evalItem.employeeId === 'carlos'
            ? 'pue-sec-01'
            : 'pue-arch-03');

    await prisma.evaluation.upsert({
      where: { id: evalItem.id },
      update: {
        cycle: 'Ciclo Anual 2026',
        employeeId: evalItem.employeeId,
        employeeName: evalItem.employeeName,
        role: evalItem.role,
        area: evalItem.area,
        avatar: evalItem.avatar,
        evaluator: evalItem.evaluator,
        selfScore: evalItem.selfScore,
        managerScore: evalItem.managerScore,
        peersScore: evalItem.peersScore,
        calibratedScore: evalItem.calibratedScore,
        box9: evalItem.box9,
        status: evalItem.status,
        potentialScore: evalItem.potentialScore,
        performanceScore: evalItem.performanceScore,
        gapAnalysis: evalItem.gapAnalysis,
        jobPositionId,
      },
      create: {
        id: evalItem.id,
        cycle: 'Ciclo Anual 2026',
        employeeId: evalItem.employeeId,
        employeeName: evalItem.employeeName,
        role: evalItem.role,
        area: evalItem.area,
        avatar: evalItem.avatar,
        evaluator: evalItem.evaluator,
        selfScore: evalItem.selfScore,
        managerScore: evalItem.managerScore,
        peersScore: evalItem.peersScore,
        calibratedScore: evalItem.calibratedScore,
        box9: evalItem.box9,
        status: evalItem.status,
        potentialScore: evalItem.potentialScore,
        performanceScore: evalItem.performanceScore,
        gapAnalysis: evalItem.gapAnalysis,
        jobPositionId,
      },
    });
  }
  console.log(`     ✓ ${INITIAL_EVALUATIONS.length} evaluaciones 9-Box cargadas vinculadas a puestos.`);

  // 5. Users (Usuarios con contraseña hasheada: Admin1234!)
  console.log('  -> Creando usuarios para inicio de sesión...');
  const passwordHash = bcrypt.hashSync('Admin1234!', 10);

  for (const user of INITIAL_USERS) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        passwordHash,
        name: user.name,
        role: user.role,
        employeeId: user.employeeId ?? null,
      },
      create: {
        id: user.id,
        email: user.email,
        passwordHash,
        name: user.name,
        role: user.role,
        employeeId: user.employeeId ?? null,
      },
    });
  }
  console.log(`     ✓ ${INITIAL_USERS.length} usuarios con roles RBAC creados (Contraseña: Admin1234!).`);

  // 6. Learning Tracks (Capacitaciones)
  console.log('  -> Creando rutas de aprendizaje (LearningTrack)...');
  for (const track of INITIAL_TRACKS) {
    await prisma.learningTrack.upsert({
      where: { id: track.id },
      update: {
        title: track.title,
        technicalTitle: track.technicalTitle ?? null,
        category: track.category,
        level: track.level,
        hours: track.hours,
        enrolledCount: track.enrolledCount,
        completionRate: track.completionRate,
        gapTarget: track.gapTarget,
        provider: track.provider,
        certification: track.certification,
        description: track.description,
        enrolledEmployees: (track.enrolledEmployees as any) ?? null,
      },
      create: {
        id: track.id,
        title: track.title,
        technicalTitle: track.technicalTitle ?? null,
        category: track.category,
        level: track.level,
        hours: track.hours,
        enrolledCount: track.enrolledCount,
        completionRate: track.completionRate,
        gapTarget: track.gapTarget,
        provider: track.provider,
        certification: track.certification,
        description: track.description,
        enrolledEmployees: (track.enrolledEmployees as any) ?? null,
      },
    });
  }
  console.log(`     ✓ ${INITIAL_TRACKS.length} rutas de aprendizaje creadas.`);

  // 7. Porter Activities (Cadena de Valor de Porter)
  console.log('  -> Creando actividades de cadena de valor (PorterActivity)...');
  for (const act of PORTER_ACTIVITIES) {
    await prisma.porterActivity.upsert({
      where: { id: act.id },
      update: {
        step: act.step,
        name: act.name,
        subname: act.subname,
        layer: act.id <= 5 ? 'primary' : 'support',
        coverage: act.coverage,
        coverageStatus: act.coverageStatus,
        headcount: act.headcount,
        costEfficiency: act.costEfficiency,
        strategicNotes: act.aiRecommendation || act.description || null,
        rolesList: (act.rolesList as any) ?? null,
        topTalent: (act.topTalent as any) ?? null,
        skillsMatrix: (act.skillsMatrix as any) ?? null,
      },
      create: {
        id: act.id,
        step: act.step,
        name: act.name,
        subname: act.subname,
        layer: act.id <= 5 ? 'primary' : 'support',
        coverage: act.coverage,
        coverageStatus: act.coverageStatus,
        headcount: act.headcount,
        costEfficiency: act.costEfficiency,
        strategicNotes: act.aiRecommendation || act.description || null,
        rolesList: (act.rolesList as any) ?? null,
        topTalent: (act.topTalent as any) ?? null,
        skillsMatrix: (act.skillsMatrix as any) ?? null,
      },
    });
  }
  console.log(`     ✓ ${PORTER_ACTIVITIES.length} actividades de cadena de valor cargadas.`);

  // 8. Reclutamiento y Selección - Modelo ER (Habilidad, Vacante, Postulante, Postulación)
  console.log('  -> Creando catálogo de Habilidades para Selección (Habilidad)...');
  const HABILIDADES_SEED = [
    { id: 1, nombre: 'Arquitectura Cloud & Microservicios', tipo: 'Técnica' },
    { id: 2, nombre: 'Seguridad Zero Trust & Criptografía', tipo: 'Técnica' },
    { id: 3, nombre: 'DevOps & CI/CD Pipelines (Kubernetes)', tipo: 'Técnica' },
    { id: 4, nombre: 'Ingeniería de Datos & Modelado SQL', tipo: 'Técnica' },
    { id: 5, nombre: 'Liderazgo de Equipos & Comunicación', tipo: 'Blanda' },
    { id: 6, nombre: 'Resolución de Problemas & Resiliencia', tipo: 'Blanda' },
    { id: 7, nombre: 'Negociación & Gestión de Stakeholders', tipo: 'Blanda' },
    { id: 8, nombre: 'Gestión Ágil de Proyectos (Scrum)', tipo: 'Blanda' },
  ];

  for (const h of HABILIDADES_SEED) {
    await prisma.habilidad.upsert({
      where: { id: h.id },
      update: { nombre: h.nombre, tipo: h.tipo },
      create: { id: h.id, nombre: h.nombre, tipo: h.tipo },
    });
  }
  console.log(`     ✓ ${HABILIDADES_SEED.length} habilidades de selección creadas.`);

  console.log('  -> Creando vacantes activas vinculadas a Puestos (Vacante)...');
  const VACANTES_SEED = [
    {
      id: 1,
      idPuesto: 'pue-arch-03',
      titulo: 'Arquitecto de Soluciones Cloud Senior',
      tipo: 'Tiempo Completo',
      requisitos: 'Experiencia > 5 años en microservicios, AWS/GCP y Kubernetes',
      beneficios: 'Bono por objetivos, prepaga premium, esquema híbrido flexible',
      area: 'Tecnología e Innovación',
      estado: 'Abierta',
      habilidadesRequeridas: [1, 3, 5, 6],
    },
    {
      id: 2,
      idPuesto: 'pue-eng-08',
      titulo: 'Ingeniero de Plataforma & DevOps',
      tipo: 'Tiempo Completo',
      requisitos: 'Sólido dominio de Terraform, Docker, Kubernetes y observabilidad',
      beneficios: 'Presupuesto de capacitación técnica anual, horario flexible',
      area: 'Operaciones e Infraestructura',
      estado: 'Abierta',
      habilidadesRequeridas: [3, 1, 6],
    },
    {
      id: 3,
      idPuesto: 'pue-sec-01',
      titulo: 'Especialista en Ciberseguridad & SOC',
      tipo: 'Tiempo Completo',
      requisitos: 'Certificación CISSP/CEH y respuesta ante incidentes críticos',
      beneficios: 'Equipamiento de última generación, esquema 100% remoto',
      area: 'Seguridad de la Información',
      estado: 'Abierta',
      habilidadesRequeridas: [2, 6, 7],
    },
    {
      id: 4,
      idPuesto: 'pue-dat-04',
      titulo: 'Analista de Datos & Business Intelligence',
      tipo: 'Tiempo Completo',
      requisitos: 'SQL avanzado, Python para analítica y pipelines ETL',
      beneficios: 'Gimnasio cubierto, cobertura médica integral',
      area: 'Datos y Analytics',
      estado: 'Abierta',
      habilidadesRequeridas: [4, 8, 5],
    },
  ];

  for (const v of VACANTES_SEED) {
    await prisma.vacante.upsert({
      where: { id: v.id },
      update: {
        idPuesto: v.idPuesto,
        titulo: v.titulo,
        tipo: v.tipo,
        requisitos: v.requisitos,
        beneficios: v.beneficios,
        area: v.area,
        estado: v.estado,
      },
      create: {
        id: v.id,
        idPuesto: v.idPuesto,
        titulo: v.titulo,
        tipo: v.tipo,
        requisitos: v.requisitos,
        beneficios: v.beneficios,
        area: v.area,
        estado: v.estado,
      },
    });

    for (const hId of v.habilidadesRequeridas) {
      await prisma.vacanteHabilidad.upsert({
        where: {
          vacanteId_habilidadId: { vacanteId: v.id, habilidadId: hId },
        },
        update: {},
        create: { vacanteId: v.id, habilidadId: hId },
      });
    }
  }
  console.log(`     ✓ ${VACANTES_SEED.length} vacantes con sus habilidades requeridas cargadas.`);

  console.log('  -> Creando perfiles de postulantes (Postulante / Perfil)...');
  const POSTULANTES_SEED = [
    {
      id: 1,
      nombre: 'Mateo',
      apellido: 'Benítez',
      dni: '38.921.450',
      correo: 'mateo.benitez@nexus.hr',
      telefono: '+54 9 381 492-1049',
      carrera: 'Licenciatura en Sistemas de Información',
      anioCursado: 'Graduado (UTN FRT)',
      legajo: 'POST-2026-001',
      area: 'Tecnología e Innovación',
      descripcion: 'Arquitecto cloud con más de 6 años liderando modernización hacia arquitecturas en microservicios y alta concurrencia.',
      requisitos: 'Disponibilidad inmediata, jornada completa',
      beneficios: 'Pretende esquema híbrido y plan de carrera técnica',
      habilidades: [1, 3, 5, 6, 8],
      postulaciones: [
        {
          vacanteId: 1,
          ranking: 94,
          justificacion: 'Cumple con el 100% de los requisitos críticos técnicos de arquitectura y kubernetes.',
          etapa: 'Oferta Final',
        },
      ],
    },
    {
      id: 2,
      nombre: 'Camila',
      apellido: 'Navarro',
      dni: '40.112.839',
      correo: 'camila.navarro@nexus.hr',
      telefono: '+54 9 381 582-9912',
      carrera: 'Ingeniería en Computación',
      anioCursado: 'Graduada (UTN FRT)',
      legajo: 'POST-2026-002',
      area: 'Operaciones e Infraestructura',
      descripcion: 'Ingeniera DevOps orientada a automatización de infraestructura como código y observabilidad.',
      requisitos: 'Experiencia en pipelines multi-cloud',
      beneficios: 'Interesada en certificaciones AWS y Kubernetes',
      habilidades: [3, 1, 6, 8],
      postulaciones: [
        {
          vacanteId: 2,
          ranking: 88,
          justificacion: 'Amplio dominio de CI/CD pipelines y automatización con Terraform y Kubernetes.',
          etapa: 'Entrevista Técnica',
        },
      ],
    },
    {
      id: 3,
      nombre: 'Gonzalo',
      apellido: 'Alonso',
      dni: '36.402.190',
      correo: 'gonzalo.alonso@nexus.hr',
      telefono: '+54 9 381 601-3841',
      carrera: 'Ingeniería en Ciberseguridad',
      anioCursado: 'Graduado',
      legajo: 'POST-2026-003',
      area: 'Seguridad de la Información',
      descripcion: 'Consultor de seguridad informática especializado en marcos de gobernanza Zero Trust y auditorías.',
      requisitos: 'Experiencia en gestión de incidentes y SOC',
      beneficios: 'Plan de salud familiar y horario flexible',
      habilidades: [2, 6, 7, 5],
      postulaciones: [
        {
          vacanteId: 3,
          ranking: 82,
          justificacion: 'Excelente base técnica en defensa de infraestructura y mitigación de amenazas.',
          etapa: 'Validación Cultural',
        },
      ],
    },
    {
      id: 4,
      nombre: 'Lucía',
      apellido: 'Méndez',
      dni: '41.839.201',
      correo: 'lucia.mendez@nexus.hr',
      telefono: '+54 9 381 411-8092',
      carrera: 'Licenciatura en Ciencias de la Computación',
      anioCursado: 'Último año',
      legajo: 'POST-2026-004',
      area: 'Datos y Analytics',
      descripcion: 'Analista de datos enfocada en modelado relacional, visualización y optimización de consultas complejas.',
      requisitos: 'Disponibilidad part-time con proyección a full-time al graduarse',
      beneficios: 'Flexibilidad horaria universitaria',
      habilidades: [4, 8, 5, 6],
      postulaciones: [
        {
          vacanteId: 4,
          ranking: 75,
          justificacion: 'Gran capacidad analítica y fundamentos sólidos en modelado de datos relacionales.',
          etapa: 'Revisión Inicial',
        },
      ],
    },
  ];

  for (const post of POSTULANTES_SEED) {
    await prisma.postulante.upsert({
      where: { id: post.id },
      update: {
        nombre: post.nombre,
        apellido: post.apellido,
        dni: post.dni,
        correo: post.correo,
        telefono: post.telefono,
        carrera: post.carrera,
        anioCursado: post.anioCursado,
        legajo: post.legajo,
        area: post.area,
        descripcion: post.descripcion,
        requisitos: post.requisitos,
        beneficios: post.beneficios,
      },
      create: {
        id: post.id,
        nombre: post.nombre,
        apellido: post.apellido,
        dni: post.dni,
        correo: post.correo,
        telefono: post.telefono,
        carrera: post.carrera,
        anioCursado: post.anioCursado,
        legajo: post.legajo,
        area: post.area,
        descripcion: post.descripcion,
        requisitos: post.requisitos,
        beneficios: post.beneficios,
      },
    });

    for (const hId of post.habilidades) {
      await prisma.perfilHabilidad.upsert({
        where: {
          perfilId_habilidadId: { perfilId: post.id, habilidadId: hId },
        },
        update: {},
        create: { perfilId: post.id, habilidadId: hId },
      });
    }

    for (const postu of post.postulaciones) {
      await prisma.postulacion.upsert({
        where: {
          perfilId_vacanteId: { perfilId: post.id, vacanteId: postu.vacanteId },
        },
        update: {
          ranking: postu.ranking,
          justificacion: postu.justificacion,
          etapa: postu.etapa,
        },
        create: {
          perfilId: post.id,
          vacanteId: postu.vacanteId,
          ranking: postu.ranking,
          justificacion: postu.justificacion,
          etapa: postu.etapa,
        },
      });
    }
  }
  console.log(`     ✓ ${POSTULANTES_SEED.length} postulantes con sus habilidades y postulaciones creados.`);

  console.log('✅ Base de datos Supabase poblada con éxito con todos los módulos.');
}

main()
  .catch((e) => {
    console.error('❌ Error ejecutando seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
