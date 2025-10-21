import { ApiPropertyOptional } from '@nestjs/swagger';

export class ParticipationDetail {
  @ApiPropertyOptional()
  consecutivo?: string | null;

  @ApiPropertyOptional()
  coordinador?: string | null;

  @ApiPropertyOptional()
  tema?: string | null;

  @ApiPropertyOptional()
  ponentes?: string[] | null;

  @ApiPropertyOptional()
  comision?: string | null;

  @ApiPropertyOptional()
  titulo?: string | null;

  @ApiPropertyOptional()
  proponentes?: string[] | null;

  @ApiPropertyOptional()
  id?: string | null;

  @ApiPropertyOptional()
  year?: string | null;

  @ApiPropertyOptional()
  proyecto_numero?: string | null;

  static fromResponse(data: ParticipationDetailResponse): ParticipationDetail {
    if (!data?.proyecto_acuerdo) {
      throw new Error('Invalid response data: proyecto_acuerdo is missing');
    }

    const proyectoAcuerdo = data.proyecto_acuerdo;

    return {
      consecutivo: proyectoAcuerdo.consecutivo?.toLowerCase() || null,
      coordinador: proyectoAcuerdo.coordinador?.toLowerCase() || null,
      tema: proyectoAcuerdo.tema?.toLowerCase() || null,
      ponentes: proyectoAcuerdo.ponentes?.map((ponente) => ponente?.toLowerCase()) || null,
      comision: proyectoAcuerdo.comision?.toLowerCase() || null,
      titulo: proyectoAcuerdo.titulo?.toLowerCase() || null,
      proponentes: proyectoAcuerdo.proponentes?.map((proponente) => proponente?.toLowerCase()) || null,
      id: proyectoAcuerdo.id?.toString() || null,
      year: proyectoAcuerdo.Año?.toString() || null,
      proyecto_numero: proyectoAcuerdo.proyecto_numero?.toLowerCase() || null,
    };
  }
}

export interface ParticipationDetailResponse {
  proyecto_acuerdo: DetalleProyectoDeAcuerdo;
  archivos?: ArchivoDocumento[];
  conceptos?: ConceptoDocumento[];
  audios?: AudioData;
  estudios?: EstudioData;
  estados?: EstadoDocumento[];
  enmiendas?: EnmiendaData;
}

interface ArchivoDocumento {
  extension: string;
  documento_file_id: number;
  documento_proyecto: string;
  nombre: string;
  modulo: string;
}

interface ConceptoDocumento {
  fecha: string;
  extension: string;
  name_file: string;
  file_solicitud: number;
  modulo: string;
  solicitadoa: string;
  respuesta?: ConceptoRespuesta[];
}

interface ConceptoRespuesta {
  fecha: string;
  file_respuesta: number;
  extension: string;
  name_file: string;
  modulo: string;
}

interface AudioData {
  archivos_sesion: unknown[];
  audios: unknown[];
}

interface EstudioData {
  reuniones: ReunionEstudio[];
  archivos_sesion: unknown[];
}

interface ReunionEstudio {
  fecha: string;
  audio_estudio: unknown[];
  citado_reunion: unknown[];
  esatado: string;
  hora: string;
  actas_estudio: ActaEstudio[];
  lugar: string;
  anexos: unknown[];
  otro_lugar: string | null;
}

interface ActaEstudio {
  extension: string;
  file_id: number;
  numero_acta: string;
  modulo: string;
  nombre_archivo: string;
}

interface EstadoDocumento {
  estado: string;
  fecha: string;
}

interface EnmiendaData {
  primer_debate: unknown[];
  segundo_debate: unknown[];
}

export interface DetalleProyectoDeAcuerdo {
  consecutivo: string;
  coordinador: string;
  tema: string;
  ponentes: string[];
  comision: string;
  titulo: string;
  proponentes: string[];
  id: number;
  Año: string;
  proyecto_numero: string;
}
