import { ApiPropertyOptional } from '@nestjs/swagger';

export class AccidentalCommissionDetail {
  @ApiPropertyOptional()
  consecutivo?: string | null;

  @ApiPropertyOptional()
  archivosDescripcion?: string[] | null;

  @ApiPropertyOptional()
  abogado?: string | null;

  @ApiPropertyOptional()
  coordinador?: string | null;

  @ApiPropertyOptional()
  tipoComision?: string | null;

  @ApiPropertyOptional()
  sesionPlenaria?: string | null;

  @ApiPropertyOptional()
  impulsor?: string | null;

  @ApiPropertyOptional()
  fechaAprobacion?: Date | null;

  @ApiPropertyOptional()
  tipoProposicion?: string | null;

  @ApiPropertyOptional()
  titulo?: string | null;

  @ApiPropertyOptional()
  temas?: string[] | null;

  @ApiPropertyOptional()
  proponentes?: Proponentes | null;

  static fromResponse(data: AccidentalCommissionDetailResponse): AccidentalCommissionDetail {
    return {
      consecutivo:
        typeof data.detalle_comision.consecutivo === 'string'
          ? data.detalle_comision.consecutivo.toLowerCase()
          : data.detalle_comision.consecutivo || null,
      archivosDescripcion:
        data.detalle_comision.archivos_descripcion
          ?.map((archivo) => (typeof archivo === 'string' ? archivo.toLowerCase() : archivo))
          .filter(Boolean) || null,
      abogado:
        typeof data.detalle_comision.abogado === 'string'
          ? data.detalle_comision.abogado.toLowerCase()
          : data.detalle_comision.abogado || null,
      coordinador:
        typeof data.detalle_comision.coordinador === 'string'
          ? data.detalle_comision.coordinador.toLowerCase()
          : data.detalle_comision.coordinador || null,
      tipoComision:
        typeof data.detalle_comision.tipo_comision === 'string'
          ? data.detalle_comision.tipo_comision.toLowerCase()
          : data.detalle_comision.tipo_comision || null,
      sesionPlenaria: data.detalle_comision.sesion_plenaria.toString() || null,
      impulsor:
        typeof data.detalle_comision.impulsor === 'string'
          ? data.detalle_comision.impulsor.toLowerCase()
          : data.detalle_comision.impulsor || null,
      fechaAprobacion: data.detalle_comision.fecha_aprobacion || null,
      tipoProposicion:
        typeof data.detalle_comision.tipo_proposicion === 'string'
          ? data.detalle_comision.tipo_proposicion.toLowerCase()
          : data.detalle_comision.tipo_proposicion || null,
      titulo:
        typeof data.detalle_comision.titulo === 'string'
          ? data.detalle_comision.titulo.toLowerCase()
          : data.detalle_comision.titulo || null,
      temas:
        data.detalle_comision.temas
          ?.map((tema) => (typeof tema === 'string' ? tema.toLowerCase() : tema))
          .filter(Boolean) || null,
      proponentes: {
        concejales:
          data.proponentes.concejales
            ?.map((concejal) => ({
              concejal: typeof concejal.concejal === 'string' ? concejal.concejal.toLowerCase() : concejal.concejal,
              bancada: typeof concejal.bancada === 'string' ? concejal.bancada.toLowerCase() : concejal.bancada,
            }))
            .filter(Boolean) || null,
        bancadas:
          data.proponentes.bancadas
            ?.map((banca) => (typeof banca === 'string' ? banca.toLowerCase() : banca))
            .filter(Boolean) || null,
      },
    };
  }
}

export interface AccidentalCommissionDetailResponse {
  detalle_comision: DetalleComision;
  proponentes: Proponentes;
}

export interface DetalleComision {
  consecutivo: string;
  archivos_descripcion: string[];
  abogado: string;
  coordinador: string;
  tipo_comision: string;
  sesion_plenaria: number;
  impulsor: string;
  fecha_aprobacion: Date;
  tipo_proposicion: string;
  titulo: string;
  temas: string[];
}

export interface Proponentes {
  concejales: Concejal[];
  bancadas: string[];
}

export interface Concejal {
  concejal: string;
  bancada: string;
}
