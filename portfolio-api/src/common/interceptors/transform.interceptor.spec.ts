import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of, lastValueFrom } from 'rxjs';
import { TransformInterceptor } from './transform.interceptor';

describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor<any>;
  const mockContext = {} as ExecutionContext;

  beforeEach(() => {
    interceptor = new TransformInterceptor();
  });

  function callWith(data: any) {
    const handler: CallHandler = { handle: () => of(data) };
    return lastValueFrom(interceptor.intercept(mockContext, handler));
  }

  it('should wrap a plain object in { data }', async () => {
    const result = await callWith({ name: 'test' });
    expect(result).toEqual({ data: { name: 'test' } });
  });

  it('should wrap a string in { data }', async () => {
    const result = await callWith('hello');
    expect(result).toEqual({ data: 'hello' });
  });

  it('should wrap an array in { data }', async () => {
    const result = await callWith([1, 2, 3]);
    expect(result).toEqual({ data: [1, 2, 3] });
  });

  it('should wrap null in { data }', async () => {
    const result = await callWith(null);
    expect(result).toEqual({ data: null });
  });

  it('should NOT double-wrap a paginated response with data property', async () => {
    const paginated = { data: [{ id: 1 }], total: 10, page: 1 };
    const result = await callWith(paginated);
    expect(result).toEqual(paginated);
  });

  it('should NOT double-wrap a response that already has data envelope', async () => {
    const envelope = { data: { id: 1, name: 'test' } };
    const result = await callWith(envelope);
    expect(result).toEqual(envelope);
  });
});
