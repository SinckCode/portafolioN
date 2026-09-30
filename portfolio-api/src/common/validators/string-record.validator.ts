import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

const isStringRecord = (value: unknown): boolean =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value) &&
  Object.values(value as Record<string, unknown>).every((v) => typeof v === 'string');

/**
 * Valida un mapa plano de string -> string, p.ej. los repos de un proyecto:
 * `{ frontend: 'https://...', backend: 'https://...' }`.
 *
 * Existe porque el schema guarda estos campos como objetos libres (las claves
 * son etiquetas variables: frontend, backend, hardware, deploy) y no hay un
 * decorador nativo de class-validator para eso.
 */
export function IsStringRecord(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isStringRecord',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate: (value: unknown) => isStringRecord(value),
        defaultMessage: ({ property }: ValidationArguments) =>
          `${property} debe ser un objeto cuyos valores sean strings`,
      },
    });
  };
}

/**
 * Valida un campo que acepta tanto una URL suelta como un mapa de URLs
 * etiquetadas. Lo usa `api` en los proyectos: unos exponen un solo endpoint
 * y otros varios (`{ videojuegos: '...', empresas: '...' }`).
 */
export function IsStringOrStringRecord(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isStringOrStringRecord',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate: (value: unknown) => typeof value === 'string' || isStringRecord(value),
        defaultMessage: ({ property }: ValidationArguments) =>
          `${property} debe ser un string o un objeto cuyos valores sean strings`,
      },
    });
  };
}
