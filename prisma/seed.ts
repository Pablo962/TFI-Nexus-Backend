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
} from '../src/data/seed-data.js';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is missing.');
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando carga de datos iniciales en Supabase (TFI-NEXUS)...');

  // 1. Job Positions (Perfiles de Puesto)
  console.log('  -> Creando perfiles de puesto (JobPosition)...');
  for (const job of JOB_POSITIONS) {
    const id =
      job.code === 'PUE-2026-ARCH-03'
        ? 'pue-arch-03'
        : job.code === 'PUE-2026-ENG-08'
          ? 'pue-eng-08'
          : job.code === 'PUE-2026-SEC-01'
            ? 'pue-sec-01'
            : 'pue-dat-04';

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
  console.log(`     ✓ ${JOB_POSITIONS.length} perfiles de puesto cargados.`);

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
      },
    });
  }
  console.log(`     ✓ ${INITIAL_EVALUATIONS.length} evaluaciones 9-Box cargadas.`);

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
  console.log(`     ✓ ${PORTER_ACTIVITIES.length} eslabones de cadena de valor de Porter cargados.`);

  console.log('✅ Base de datos Supabase poblada con éxito.');
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
