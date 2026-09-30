import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateProjectDto } from './create-project.dto';

/**
 * El DTO tiene que coincidir con project.schema.ts. Cuando divergieron, guardar
 * un proyecto destruia los links de sus repos: el schema esperaba
 * `{ frontend, backend }` y el DTO declaraba `[{ label, url }]`.
 */
const validateDto = (payload: Record<string, unknown>) =>
  validate(plainToInstance(CreateProjectDto, payload), { whitelist: true });

const base = {
  title: 'Clima Aula',
  description: 'Monitoreo ambiental de un aula con ESP32.',
};

const errorsFor = async (payload: Record<string, unknown>, property: string) => {
  const errors = await validateDto(payload);
  return errors.filter((e) => e.property === property);
};

describe('CreateProjectDto', () => {
  it('acepta lo minimo indispensable', async () => {
    await expect(validateDto(base)).resolves.toHaveLength(0);
  });

  describe('repos', () => {
    it('acepta el mapa etiqueta -> URL que guarda el schema', async () => {
      const repos = {
        frontend: 'https://github.com/SinckCode/clima-web',
        backend: 'https://github.com/SinckCode/SensoresApi',
        hardware: 'https://github.com/SinckCode/SketchArduino',
      };
      await expect(errorsFor({ ...base, repos }, 'repos')).resolves.toHaveLength(0);
    });

    it('rechaza el array de { label, url } que rompio los 17 proyectos', async () => {
      const repos = [{ label: 'frontend', url: 'https://github.com/SinckCode/clima-web' }];
      await expect(errorsFor({ ...base, repos }, 'repos')).resolves.not.toHaveLength(0);
    });

    it('rechaza valores que no sean strings', async () => {
      const repos = { frontend: { url: 'https://github.com/SinckCode/clima-web' } };
      await expect(errorsFor({ ...base, repos }, 'repos')).resolves.not.toHaveLength(0);
    });
  });

  describe('campos que el DTO antiguo no declaraba', () => {
    it('acepta video, videos y demos', async () => {
      const payload = {
        ...base,
        video: '/projects/SensoresClima/SensoresClimaV.mp4',
        videos: ['/projects/succedingMedia/succedingMedia.mp4'],
        demos: ['https://portafolio-sm.web.app'],
      };
      await expect(validateDto(payload)).resolves.toHaveLength(0);
    });

    it('acepta credenciales de prueba y las valida', async () => {
      const ok = { ...base, credentials: { email: 'demo@ejemplo.com', password: '123456' } };
      await expect(validateDto(ok)).resolves.toHaveLength(0);

      const bad = { ...base, credentials: { email: 'no-es-un-email', password: '123456' } };
      await expect(errorsFor(bad, 'credentials')).resolves.not.toHaveLength(0);
    });

    it('acepta api como URL suelta o como mapa de URLs', async () => {
      const single = { ...base, api: 'https://mygameshelf.angelonesto.com/' };
      await expect(errorsFor(single, 'api')).resolves.toHaveLength(0);

      const multiple = {
        ...base,
        api: {
          videojuegos: 'https://whale-app.ondigitalocean.app/videojuegos',
          empresas: 'https://whale-app.ondigitalocean.app/companies',
        },
      };
      await expect(errorsFor(multiple, 'api')).resolves.toHaveLength(0);

      const invalid = { ...base, api: 42 };
      await expect(errorsFor(invalid, 'api')).resolves.not.toHaveLength(0);
    });
  });
});
