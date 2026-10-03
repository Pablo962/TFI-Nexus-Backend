/**
 * Glosario de competencias.
 *
 * Fuente única de verdad para mostrar nombres de competencias técnicas en un
 * lenguaje comprensible para Recursos Humanos. Cada entrada define:
 *  - label:     nombre claro en español (lo que se muestra como título)
 *  - technical: nombre técnico original (se muestra como dato secundario)
 *
 * Solo afecta a la presentación: los datos asociados (cantidades, niveles,
 * porcentajes, estados) no se tocan.
 */
export interface CompetenciaGlosario {
  label: string;
  technical: string;
}

export const GLOSARIO = {
  kubernetes: {
    label: 'Gestión de servidores y clústeres',
    technical: 'Kubernetes & Clústeres',
  },
  eventos: {
    label: 'Procesamiento de eventos y datos',
    technical: 'Apache Kafka & Event-Driven',
  },
  seguridadNube: {
    label: 'Seguridad y acceso en la nube',
    technical: 'Zero Trust & Cloud IAM',
  },
  ia: {
    label: 'Inteligencia Artificial y modelos de lenguaje',
    technical: 'PyTorch & Inferencia LLM',
  },
  costosNube: {
    label: 'Gestión de costos en la nube',
    technical: 'FinOps Cloud Economics',
  },
  cache: {
    label: 'Optimización y velocidad de sistemas',
    technical: 'Distributed In-Memory Caching',
  },
} as const satisfies Record<string, CompetenciaGlosario>;

export type GlosarioKey = keyof typeof GLOSARIO;

/** Etiquetas de demanda / prioridad en lenguaje natural. */
export const ETIQUETAS_DEMANDA = {
  criticaAlta: 'Alta prioridad',
  estrategica: 'Competencia estratégica',
  creciente: (pct: number) => `En crecimiento (+${pct}%)`,
  oportunidadCapacitacion: 'Oportunidad de capacitación',
} as const;
