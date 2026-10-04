import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';

import {
  JOB_POSITIONS,
  EMPLOYEES_DATA,
  INITIAL_USERS,
  INITIAL_TRACKS,
  INITIAL_EVALUATIONS,
  PORTER_ACTIVITIES,
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
  console.log('🌱 Iniciando carga de datos en Supabase (Opción A: 12 Tablas)...');

  // 1. Usuarios (users)
  console.log('  -> Creando usuarios del sistema (users)...');
  for (const u of INITIAL_USERS) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        role: u.role as any,
        employeeId: u.employeeId,
      },
      create: {
        id: u.id,
        email: u.email,
        passwordHash: u.passwordHash,
        name: u.name,
        role: u.role as any,
        employeeId: u.employeeId,
      },
    });
  }
  console.log(`     ✓ ${INITIAL_USERS.length} usuarios creados.`);

  // 2. Puestos de Trabajo (job_positions)
  console.log('  -> Creando catálogo de puestos de trabajo (job_positions)...');
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
        purposeLink: job.purposeLink,
        internalRelations: job.internalRelations,
        externalRelations: job.externalRelations,
        formalAuthority: job.formalAuthority,
        workingConditions: job.workingConditions as any,
        responsibilities: job.responsibilities as any,
        techSkills: job.techSkills as any,
        softSkills: job.softSkills as any,
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
        purposeLink: job.purposeLink,
        internalRelations: job.internalRelations,
        externalRelations: job.externalRelations,
        formalAuthority: job.formalAuthority,
        workingConditions: job.workingConditions as any,
        responsibilities: job.responsibilities as any,
        techSkills: job.techSkills as any,
        softSkills: job.softSkills as any,
      },
    });
  }
  console.log(`     ✓ ${JOB_POSITIONS.length} puestos cargados.`);

  // 3. Colaboradores / Empleados (employees)
  console.log('  -> Creando colaboradores (employees)...');
  for (const emp of EMPLOYEES_DATA) {
    const matchedJob = JOB_POSITIONS.find(
      (j) => j.title.toLowerCase() === emp.role.toLowerCase(),
    );
    const jobPositionId = matchedJob ? getJobId(matchedJob.code) : null;

    await prisma.employee.upsert({
      where: { id: emp.id },
      update: {
        empId: emp.empId,
        name: emp.name,
        email: emp.email,
        phone: emp.phone,
        role: emp.role,
        area: emp.area,
        tenure: emp.tenure,
        contract: emp.contract,
        location: emp.location,
        salaryBand: emp.salaryBand,
        percentile: emp.percentile,
        avatar: emp.avatar,
        supervisorName: emp.supervisor?.name || 'Dirección General',
        supervisorRole: emp.supervisor?.role || 'Director',
        supervisorAvatar: emp.supervisor?.avatar || emp.avatar,
        roleMatch: emp.roleMatch,
        gFactor: emp.gFactor,
        status: emp.status,
        badge: emp.badge,
        criticality: 8.5,
        riskStatus: (emp.status === 'Crítico' ? 'spof' : 'optimal') as any,
        spectrumSkills: emp.spectrumSkills as any,
        hardSkills: emp.hardSkills as any,
        softSkills: emp.softSkills as any,
        recommendedTraining: emp.recommendedTraining as any,
        reviews: emp.reviews as any,
        projects: emp.projects as any,
        jobPositionId,
      },
      create: {
        id: emp.id,
        empId: emp.empId,
        name: emp.name,
        email: emp.email,
        phone: emp.phone,
        role: emp.role,
        area: emp.area,
        tenure: emp.tenure,
        contract: emp.contract,
        location: emp.location,
        salaryBand: emp.salaryBand,
        percentile: emp.percentile,
        avatar: emp.avatar,
        supervisorName: emp.supervisor?.name || 'Dirección General',
        supervisorRole: emp.supervisor?.role || 'Director',
        supervisorAvatar: emp.supervisor?.avatar || emp.avatar,
        roleMatch: emp.roleMatch,
        gFactor: emp.gFactor,
        status: emp.status,
        badge: emp.badge,
        criticality: 8.5,
        riskStatus: (emp.status === 'Crítico' ? 'spof' : 'optimal') as any,
        spectrumSkills: emp.spectrumSkills as any,
        hardSkills: emp.hardSkills as any,
        softSkills: emp.softSkills as any,
        recommendedTraining: emp.recommendedTraining as any,
        reviews: emp.reviews as any,
        projects: emp.projects as any,
        jobPositionId,
      },
    });
  }
  console.log(`     ✓ ${EMPLOYEES_DATA.length} colaboradores creados.`);

  // 4. Evaluaciones 9-Box (evaluations)
  console.log('  -> Creando evaluaciones de desempeño (evaluations)...');
  for (const ev of INITIAL_EVALUATIONS) {
    await prisma.evaluation.upsert({
      where: { id: ev.id },
      update: {
        employeeId: ev.employeeId,
        employeeName: ev.employeeName,
        role: ev.role,
        area: ev.area,
        cycle: ev.cycle,
        performanceScore: ev.performanceScore,
        potentialScore: ev.potentialScore,
        box9: ev.box9,
        status: ev.status,
        selfScore: ev.selfScore,
        managerScore: ev.managerScore,
        peersScore: ev.peersScore,
        calibratedScore: ev.calibratedScore,
        gapAnalysis: ev.gapAnalysis,
      },
      create: {
        id: ev.id,
        employeeId: ev.employeeId,
        employeeName: ev.employeeName,
        role: ev.role,
        area: ev.area,
        cycle: ev.cycle,
        performanceScore: ev.performanceScore,
        potentialScore: ev.potentialScore,
        box9: ev.box9,
        status: ev.status,
        selfScore: ev.selfScore,
        managerScore: ev.managerScore,
        peersScore: ev.peersScore,
        calibratedScore: ev.calibratedScore,
        gapAnalysis: ev.gapAnalysis,
      },
    });
  }
  console.log(`     ✓ ${INITIAL_EVALUATIONS.length} evaluaciones cargadas.`);

  // 5. Cursos de Capacitación (learning_tracks)
  console.log('  -> Creando catálogo formativo (learning_tracks)...');
  for (const tr of INITIAL_TRACKS) {
    const duration = (tr as any).duration || `${(tr as any).hours || 40} horas`;
    const cost = (tr as any).cost || 'USD 1,200';
    const status = (tr as any).status || 'En curso';
    await prisma.learningTrack.upsert({
      where: { id: tr.id },
      update: {
        title: tr.title,
        category: tr.category,
        duration,
        provider: tr.provider,
        level: tr.level,
        cost,
        enrolledCount: tr.enrolledCount,
        status,
        skillsCovered: (tr as any).skillsCovered || [],
        modules: (tr as any).modules || [],
        enrolledEmployees: tr.enrolledEmployees as any,
      },
      create: {
        id: tr.id,
        title: tr.title,
        category: tr.category,
        duration,
        provider: tr.provider,
        level: tr.level,
        cost,
        enrolledCount: tr.enrolledCount,
        status,
        skillsCovered: (tr as any).skillsCovered || [],
        modules: (tr as any).modules || [],
        enrolledEmployees: tr.enrolledEmployees as any,
      },
    });
  }
  console.log(`     ✓ ${INITIAL_TRACKS.length} cursos de capacitación creados.`);

  // 6. Cadena de Valor (porter_activities)
  console.log('  -> Creando actividades de Porter (porter_activities)...');
  for (const pa of PORTER_ACTIVITIES) {
    await prisma.porterActivity.upsert({
      where: { id: pa.id },
      update: {
        step: pa.step,
        name: pa.name,
        subname: pa.subname,
        layer: (pa.layer || 'primary') as any,
        coverage: pa.coverage,
        coverageStatus: pa.coverageStatus,
        headcount: pa.headcount,
        costEfficiency: pa.costEfficiency,
        strategicNotes: pa.description,
        rolesList: pa.rolesList as any,
        topTalent: pa.topTalent as any,
        skillsMatrix: pa.skillsMatrix as any,
      },
      create: {
        id: pa.id,
        step: pa.step,
        name: pa.name,
        subname: pa.subname,
        layer: (pa.layer || 'primary') as any,
        coverage: pa.coverage,
        coverageStatus: pa.coverageStatus,
        headcount: pa.headcount,
        costEfficiency: pa.costEfficiency,
        strategicNotes: pa.description,
        rolesList: pa.rolesList as any,
        topTalent: pa.topTalent as any,
        skillsMatrix: pa.skillsMatrix as any,
      },
    });
  }
  console.log(`     ✓ ${PORTER_ACTIVITIES.length} actividades de Porter cargadas.`);

  // 7. Habilidades (habilidad)
  console.log('  -> Creando catálogo de habilidades de selección (habilidad)...');
  const HABILIDADES_SEED = [
    { id: 1, nombre: 'Kubernetes y Arquitectura Cloud', tipo: 'Técnica' },
    { id: 2, nombre: 'Ciberseguridad Zero Trust', tipo: 'Técnica' },
    { id: 3, nombre: 'Automatización CI/CD e Infraestructura', tipo: 'Técnica' },
    { id: 4, nombre: 'Modelado Relacional y SQL Avanzado', tipo: 'Técnica' },
    { id: 5, nombre: 'Resolución Crítica de Problemas', tipo: 'Blanda' },
    { id: 6, nombre: 'Comunicación Técnica Asertiva', tipo: 'Blanda' },
    { id: 7, nombre: 'Gestión y Respuesta ante Incidentes', tipo: 'Técnica' },
    { id: 8, nombre: 'Optimización de Rendimiento y Costos Cloud', tipo: 'Técnica' },
  ];

  for (const h of HABILIDADES_SEED) {
    await prisma.habilidad.upsert({
      where: { id: h.id },
      update: { nombre: h.nombre, tipo: h.tipo },
      create: { id: h.id, nombre: h.nombre, tipo: h.tipo },
    });
  }
  console.log(`     ✓ ${HABILIDADES_SEED.length} habilidades cargadas.`);

  // 8. Vacantes (vacante)
  console.log('  -> Creando vacantes (vacante)...');
  const VACANTES_SEED = [
    {
      id: 1,
      idPuesto: 'pue-arch-03',
      titulo: 'Arquitecto de Soluciones Cloud Senior',
      tipo: 'Tiempo Completo',
      requisitos: 'Experiencia > 5 años en microservicios, AWS/GCP y Kubernetes',
      habilidadesRequeridas: [1, 3, 5, 6],
    },
    {
      id: 2,
      idPuesto: 'pue-eng-08',
      titulo: 'Ingeniero de Plataforma & DevOps',
      tipo: 'Tiempo Completo',
      requisitos: 'Sólido dominio de Terraform, Docker, Kubernetes y observabilidad',
      habilidadesRequeridas: [3, 1, 6],
    },
    {
      id: 3,
      idPuesto: 'pue-sec-01',
      titulo: 'Especialista en Ciberseguridad & SOC',
      tipo: 'Tiempo Completo',
      requisitos: 'Certificación CISSP/CEH y respuesta ante incidentes críticos',
      habilidadesRequeridas: [2, 6, 7],
    },
    {
      id: 4,
      idPuesto: 'pue-dat-04',
      titulo: 'Analista de Datos & Business Intelligence',
      tipo: 'Tiempo Completo',
      requisitos: 'SQL avanzado, Python para analítica y pipelines ETL',
      habilidadesRequeridas: [4, 8, 5],
    },
  ];

  for (const v of VACANTES_SEED) {
    await prisma.vacante.upsert({
      where: { id: v.id },
      update: {
        idPuesto: v.idPuesto,
        titulo: v.titulo,
        requisitos: v.requisitos,
        tipo: v.tipo,
      },
      create: {
        id: v.id,
        idPuesto: v.idPuesto,
        titulo: v.titulo,
        requisitos: v.requisitos,
        tipo: v.tipo,
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
  console.log(`     ✓ ${VACANTES_SEED.length} vacantes y sus requisitos vinculados.`);

  // 9. Perfiles de Postulantes (perfil)
  console.log('  -> Creando perfiles de postulantes (perfil)...');
  const PERFILES_SEED = [
    {
      id: 1,
      nombre: 'Mateo',
      apellido: 'Benítez',
      dni: '38.921.450',
      fechaNacimiento: new Date('1994-06-15'),
      direccion: 'Av. Aconquija 1420, Yerba Buena, Tucumán',
      telefono: '+54 9 381 492-1049',
      correo: 'mateo.benitez@nexus.hr',
      carrera: 'Licenciatura en Sistemas de Información',
      anioCursado: 'Graduado (UTN FRT)',
      legajo: 'POST-2026-001',
      descripcion: 'Arquitecto cloud con más de 6 años liderando modernización hacia arquitecturas en microservicios y alta concurrencia.',
      area: 'Tecnología e Innovación',
      requisitos: 'Disponibilidad inmediata, dedicación full-time',
      beneficios: 'Pretende esquema híbrido y plan de carrera técnica',
      perfilAsignado: 'Arquitecto Cloud Senior',
      justificacion: 'Cumple con el 100% de los requisitos críticos técnicos de arquitectura y kubernetes.',
      habilidades: [1, 3, 5, 6, 8],
      postulaciones: [
        {
          vacanteId: 1,
          ranking: 94,
          justificacion: 'Cumple con el 100% de los requisitos críticos técnicos de arquitectura y kubernetes.',
        },
      ],
    },
    {
      id: 2,
      nombre: 'Camila',
      apellido: 'Navarro',
      dni: '40.112.839',
      fechaNacimiento: new Date('1997-03-22'),
      direccion: 'Crisóstomo Álvarez 650, San Miguel de Tucumán',
      telefono: '+54 9 381 582-9912',
      correo: 'camila.navarro@nexus.hr',
      carrera: 'Ingeniería en Computación',
      anioCursado: 'Graduada (UTN FRT)',
      legajo: 'POST-2026-002',
      descripcion: 'Ingeniera DevOps orientada a automatización de infraestructura como código y observabilidad.',
      area: 'Operaciones e Infraestructura',
      requisitos: 'Experiencia en pipelines multi-cloud',
      beneficios: 'Interesada en certificaciones AWS y Kubernetes',
      perfilAsignado: 'DevOps / Platform Engineer',
      justificacion: 'Amplio dominio de CI/CD pipelines y automatización con Terraform y Kubernetes.',
      habilidades: [3, 1, 6, 8],
      postulaciones: [
        {
          vacanteId: 2,
          ranking: 88,
          justificacion: 'Amplio dominio de CI/CD pipelines y automatización con Terraform y Kubernetes.',
        },
      ],
    },
    {
      id: 3,
      nombre: 'Gonzalo',
      apellido: 'Alonso',
      dni: '36.402.190',
      fechaNacimiento: new Date('1991-11-08'),
      direccion: 'Muñecas 820, San Miguel de Tucumán',
      telefono: '+54 9 381 601-3841',
      correo: 'gonzalo.alonso@nexus.hr',
      carrera: 'Ingeniería en Ciberseguridad',
      anioCursado: 'Graduado',
      legajo: 'POST-2026-003',
      descripcion: 'Consultor de seguridad informática especializado en marcos de gobernanza Zero Trust y auditorías.',
      area: 'Seguridad de la Información',
      requisitos: 'Experiencia en gestión de incidentes y SOC',
      beneficios: 'Plan de salud familiar y horario flexible',
      perfilAsignado: 'Especialista en Ciberseguridad',
      justificacion: 'Excelente base técnica en defensa de infraestructura y mitigación de amenazas.',
      habilidades: [2, 6, 7, 5],
      postulaciones: [
        {
          vacanteId: 3,
          ranking: 82,
          justificacion: 'Excelente base técnica en defensa de infraestructura y mitigación de amenazas.',
        },
      ],
    },
    {
      id: 4,
      nombre: 'Lucía',
      apellido: 'Méndez',
      dni: '41.839.201',
      fechaNacimiento: new Date('1999-08-19'),
      direccion: 'San Martín 1120, Yerba Buena, Tucumán',
      telefono: '+54 9 381 411-8092',
      correo: 'lucia.mendez@nexus.hr',
      carrera: 'Licenciatura en Ciencias de la Computación',
      anioCursado: 'Último año',
      legajo: 'POST-2026-004',
      descripcion: 'Analista de datos enfocada en modelado relacional, visualización y optimización de consultas complejas.',
      area: 'Datos y Analytics',
      requisitos: 'Disponibilidad part-time con proyección a full-time al graduarse',
      beneficios: 'Flexibilidad horaria universitaria',
      perfilAsignado: 'Analista de Datos Junior',
      justificacion: 'Gran capacidad analítica y fundamentos sólidos en modelado de datos relacionales.',
      habilidades: [4, 8, 5, 6],
      postulaciones: [
        {
          vacanteId: 4,
          ranking: 75,
          justificacion: 'Gran capacidad analítica y fundamentos sólidos en modelado de datos relacionales.',
        },
      ],
    },
  ];

  for (const post of PERFILES_SEED) {
    await prisma.perfil.upsert({
      where: { id: post.id },
      update: {
        nombre: post.nombre,
        apellido: post.apellido,
        dni: post.dni,
        fechaNacimiento: post.fechaNacimiento,
        direccion: post.direccion,
        telefono: post.telefono,
        correo: post.correo,
        carrera: post.carrera,
        anioCursado: post.anioCursado,
        legajo: post.legajo,
        descripcion: post.descripcion,
        area: post.area,
        requisitos: post.requisitos,
        beneficios: post.beneficios,
        perfilAsignado: post.perfilAsignado,
        justificacion: post.justificacion,
      },
      create: {
        id: post.id,
        nombre: post.nombre,
        apellido: post.apellido,
        dni: post.dni,
        fechaNacimiento: post.fechaNacimiento,
        direccion: post.direccion,
        telefono: post.telefono,
        correo: post.correo,
        carrera: post.carrera,
        anioCursado: post.anioCursado,
        legajo: post.legajo,
        descripcion: post.descripcion,
        area: post.area,
        requisitos: post.requisitos,
        beneficios: post.beneficios,
        perfilAsignado: post.perfilAsignado,
        justificacion: post.justificacion,
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
        },
        create: {
          perfilId: post.id,
          vacanteId: postu.vacanteId,
          ranking: postu.ranking,
          justificacion: postu.justificacion,
        },
      });
    }
  }
  console.log(`     ✓ ${PERFILES_SEED.length} perfiles cargados con habilidades y postulaciones.`);

  console.log('✅ Base de datos Supabase poblada con éxito con las 12 tablas (Opción A).');
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
