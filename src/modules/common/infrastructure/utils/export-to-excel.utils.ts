/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import * as ExcelJS from 'exceljs';
import { Prisma } from '@prisma/client';

interface JsonExportOptions {
  worksheetName?: string;
}

interface ProcessedData {
  data: Record<string, unknown>[];
  fields: string[];
  fieldMappings?: Map<string, string>;
}

interface ExcelExportConfig {
  worksheetName: string;
  headerColor: string;
  headerTextColor: string;
  borderColor: string;
  maxColumnWidth: number;
  minColumnWidth: number;
}

const DEFAULT_CONFIG: ExcelExportConfig = {
  worksheetName: 'Data',
  headerColor: 'FF366092',
  headerTextColor: 'FFFFFFFF',
  borderColor: 'FFD0D0D0',
  maxColumnWidth: 50,
  minColumnWidth: 10,
};

// Utility functions for type checking
const isPrismaDecimal = (value: unknown): value is Prisma.Decimal => value instanceof Prisma.Decimal;

const isJsonObject = (value: unknown): value is Record<string, unknown> =>
  value !== null &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  Object.prototype.toString.call(value) !== '[object Date]' &&
  !isPrismaDecimal(value);

const isValidNumber = (value: string): boolean => {
  const numValue = Number(value);

  return !Number.isNaN(numValue) && Number.isFinite(numValue) && value.trim() !== '';
};

const encodeToBase64 = (buffer: Buffer): string => {
  return buffer.toString('base64');
};

// Field formatting and processing
class FieldFormatter {
  static formatFieldName(field: string): string {
    // Remove polymorphic field suffix for display
    const cleanField = field.replace(/_(?:ADDRESS|PHONE_NUMBER|EMAIL|CONTACT)$/, '');

    return cleanField
      .split('.')
      .map((part) =>
        part
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, (str) => str.toUpperCase())
          .trim(),
      )
      .join(' ');
  }

  static formatHeaderText(field: string): string {
    // Remove polymorphic field suffix for display
    const cleanField = field.replace(/_(?:ADDRESS|PHONE_NUMBER|EMAIL|CONTACT)$/, '');

    return cleanField
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .replace(/\./g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  static formatColumnName(columnName: string): string {
    return columnName
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  static formatCellValue(value: unknown, timezone: string, dateFormat: string): string | number | boolean | Date {
    if (value instanceof Date) return value.toLocaleDateString();
    // return utcDateToTimezone({ date: value, timezone, dateFormat });
    if (typeof value === 'boolean') return value ? 'YES' : 'NO';
    if (value === null || value === undefined) return '';

    if (isPrismaDecimal(value)) {
      return value.toNumber();
    }

    if (typeof value === 'number') return value;
    if (typeof value === 'object') return JSON.stringify(value);

    if (typeof value === 'string' && isValidNumber(value)) {
      return Number(value);
    }

    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return String(value);
  }
}

// JSON field expansion logic
class JsonFieldExpander {
  private readonly requestedFields: string[];

  private readonly data: unknown[];

  private readonly fieldMappings: Map<string, string>;

  constructor(data: unknown[], requestedFields: string[], fieldMappings?: Map<string, string>) {
    this.data = data;
    this.requestedFields = requestedFields;
    this.fieldMappings = fieldMappings || new Map();
  }

  expand(): ProcessedData {
    if (this.data.length === 0) {
      return { data: [], fields: this.requestedFields, fieldMappings: this.fieldMappings };
    }

    const fieldCategories = this.categorizeFields();
    const expandedFields = this.buildExpandedFields(fieldCategories);
    const expandedData = this.transformData(expandedFields);

    return {
      data: expandedData,
      fields: expandedFields.map((field) => this.getDisplayName(field)),
      fieldMappings: this.fieldMappings,
    };
  }

  private getDisplayName(field: string): string {
    return this.fieldMappings.get(field) || FieldFormatter.formatFieldName(field);
  }

  private categorizeFields() {
    const jsonFieldsToExpand = new Set<string>();
    const specificJsonFields = new Set<string>();
    const nonJsonFields = new Set<string>();

    for (const field of this.requestedFields) {
      if (field.includes('.')) {
        specificJsonFields.add(field);
        jsonFieldsToExpand.add(field.split('.')[0]);
      } else {
        const isJsonField = this.data.some((record) => isJsonObject((record as Record<string, unknown>)[field]));

        if (isJsonField) {
          jsonFieldsToExpand.add(field);
        } else {
          nonJsonFields.add(field);
        }
      }
    }

    return { jsonFieldsToExpand, specificJsonFields, nonJsonFields };
  }

  private buildExpandedFields(fieldCategories: {
    jsonFieldsToExpand: Set<string>;
    specificJsonFields: Set<string>;
    nonJsonFields: Set<string>;
  }): string[] {
    const { jsonFieldsToExpand, specificJsonFields, nonJsonFields } = fieldCategories;
    const expandedFields: string[] = [];

    // Preserve order from requestedFields instead of iterating over sets
    for (const originalField of this.requestedFields) {
      if (originalField.includes('.')) {
        this.addUniqueField(expandedFields, originalField);
      } else if (nonJsonFields.has(originalField)) {
        this.addUniqueField(expandedFields, originalField);
      } else if (jsonFieldsToExpand.has(originalField)) {
        this.expandJsonField(originalField, specificJsonFields, expandedFields);
      }
    }

    return expandedFields;
  }

  private expandJsonField(originalField: string, specificJsonFields: Set<string>, expandedFields: string[]): void {
    const hasSpecifics = [...specificJsonFields].some((f) => f.startsWith(`${originalField}.`));

    if (hasSpecifics) {
      // Preserve order by iterating through requestedFields instead of specificJsonFields
      for (const requestedField of this.requestedFields) {
        if (specificJsonFields.has(requestedField) && requestedField.startsWith(`${originalField}.`)) {
          this.addUniqueField(expandedFields, requestedField);
        }
      }
    } else {
      const allSubFields = this.getAllSubFields(originalField);
      const sortedSubFields = Array.from(allSubFields).sort();

      for (const subField of sortedSubFields) {
        this.addUniqueField(expandedFields, subField);
      }
    }
  }

  private getAllSubFields(originalField: string): Set<string> {
    const allSubFields = new Set<string>();

    for (const record of this.data) {
      const jsonValue = (record as Record<string, unknown>)[originalField];

      if (isJsonObject(jsonValue)) {
        for (const subField of Object.keys(jsonValue)) {
          allSubFields.add(`${originalField}.${subField}`);
        }
      }
    }

    return allSubFields;
  }

  private addUniqueField(fields: string[], field: string): void {
    if (!fields.includes(field)) {
      fields.push(field);
    }
  }

  private transformData(expandedFields: string[]): Record<string, unknown>[] {
    return this.data.map((record) => {
      const expandedRecord: Record<string, unknown> = {};
      const typedRecord = record as Record<string, unknown>;

      for (const field of expandedFields) {
        const displayName = this.getDisplayName(field);

        // Check if the field exists as a flat key first (for polymorphic fields)
        if (field in typedRecord) {
          expandedRecord[displayName] = typedRecord[field] !== undefined ? typedRecord[field] : '';
        } else if (field.includes('.')) {
          // Navigate nested structure
          expandedRecord[displayName] = this.getNestedValueDeep(typedRecord, field);
        } else {
          expandedRecord[displayName] = typedRecord[field] !== undefined ? typedRecord[field] : '';
        }
      }

      return expandedRecord;
    });
  }

  private getNestedValueDeep(record: Record<string, unknown>, fieldPath: string): unknown {
    const fieldParts = fieldPath.split('.');
    let currentValue: unknown = record;

    for (const part of fieldParts) {
      if (currentValue === null || currentValue === undefined) {
        return '';
      }

      if (typeof currentValue === 'object' && currentValue !== null) {
        currentValue = (currentValue as Record<string, unknown>)[part];
      } else {
        return '';
      }
    }

    return currentValue ?? '';
  }
}

// Excel styling and formatting
class ExcelStyler {
  private readonly config: ExcelExportConfig;

  constructor(config: ExcelExportConfig = DEFAULT_CONFIG) {
    this.config = config;
  }

  createWorksheetHeaders(fields: string[]): Partial<ExcelJS.Column>[] {
    return fields.map((field) => ({
      header: field, // Now using the already formatted field name
      key: field,
      width: this.config.minColumnWidth,
    }));
  }

  styleHeaderRow(row: ExcelJS.Row): void {
    row.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: this.config.headerTextColor } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: this.config.headerColor },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      this.applyCellBorder(cell);
    });
  }

  applyDataRowStyles(row: ExcelJS.Row): void {
    row.eachCell((cell) => {
      this.applyCellBorder(cell, this.config.borderColor);
      cell.alignment = { vertical: 'middle' };
    });
  }

  autoAdjustColumnWidths(worksheet: ExcelJS.Worksheet): void {
    worksheet.columns?.forEach((column) => {
      let maxLength = this.config.minColumnWidth;

      column.eachCell?.({ includeEmpty: false }, (cell) => {
        const cellLength = cell.value?.toString().length || 0;

        maxLength = Math.min(Math.max(maxLength, cellLength + 2), this.config.maxColumnWidth);
      });

      const columnWidth = column;

      columnWidth.width = maxLength;
    });
  }

  setupWorksheetView(worksheet: ExcelJS.Worksheet, fieldsCount: number): void {
    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    if (fieldsCount > 0) {
      const lastColumn = String.fromCharCode(64 + fieldsCount);

      worksheet.autoFilter = {
        from: 'A1',
        to: `${lastColumn}1`,
      };
    }
  }

  private applyCellBorder(cell: ExcelJS.Cell, color?: string): void {
    const borderColor = color || 'FF000000';

    cell.border = {
      top: { style: 'thin', color: { argb: borderColor } },
      left: { style: 'thin', color: { argb: borderColor } },
      bottom: { style: 'thin', color: { argb: borderColor } },
      right: { style: 'thin', color: { argb: borderColor } },
    };
  }
}

// Main Excel generator
class ExcelGenerator {
  private readonly styler: ExcelStyler;

  constructor(config?: ExcelExportConfig) {
    this.styler = new ExcelStyler(config);
  }

  async generateExcel(
    processedData: ProcessedData,
    timezone: string,
    dateFormat: string,
    worksheetName: string = DEFAULT_CONFIG.worksheetName,
  ): Promise<string> {
    const { data, fields } = processedData;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(worksheetName);

    this.setupWorksheet(worksheet, fields);

    if (data.length > 0) {
      this.populateData(worksheet, data, fields, timezone, dateFormat);
      this.applyRowStyles(worksheet);
    }

    this.finalizeWorksheet(worksheet, fields.length);

    const buffer = await workbook.xlsx.writeBuffer();

    return encodeToBase64(buffer as unknown as Buffer);
  }

  private setupWorksheet(worksheet: ExcelJS.Worksheet, fields: string[]): void {
    worksheet.columns = this.styler.createWorksheetHeaders(fields);
    this.styler.styleHeaderRow(worksheet.getRow(1));
  }

  private populateData(
    worksheet: ExcelJS.Worksheet,
    data: Record<string, unknown>[],
    fields: string[],
    timezone: string,
    dateFormat: string,
  ): void {
    data.forEach((record) => {
      const row = fields.reduce(
        (acc, field) => {
          acc[field] = FieldFormatter.formatCellValue(record[field], timezone, dateFormat);

          return acc;
        },
        {} as Record<string, string | number | boolean | Date>,
      );

      worksheet.addRow(row);
    });
  }

  private applyRowStyles(worksheet: ExcelJS.Worksheet): void {
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        this.styler.applyDataRowStyles(row);
      }
    });
  }

  private finalizeWorksheet(worksheet: ExcelJS.Worksheet, fieldsCount: number): void {
    this.styler.autoAdjustColumnWidths(worksheet);
    this.styler.setupWorksheetView(worksheet, fieldsCount);
  }
}

// JSON data processor
class JsonDataProcessor {
  process(data: Record<string, unknown>[], options: JsonExportOptions): ProcessedData {
    if (data.length === 0) {
      return { data: [], fields: [] };
    }

    const expander = new JsonFieldExpander(data, Object.keys(data[0] ?? {}));

    return expander.expand();
  }
}

// Public API functions
export const exportToExcelWithJson = async (
  jsonData: Record<string, unknown>[],
  timezone: string,
  dateFormat: string,
  options: JsonExportOptions = {},
): Promise<string> => {
  const processor = new JsonDataProcessor();
  const generator = new ExcelGenerator();

  const processedData = processor.process(jsonData, options);

  return generator.generateExcel(
    processedData,
    timezone,
    dateFormat,
    options.worksheetName || DEFAULT_CONFIG.worksheetName,
  );
};
