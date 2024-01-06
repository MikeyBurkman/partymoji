import type {
  ParamFunction,
  EffectFn,
  Effect,
  ParamType,
} from '~/domain/types';

export const buildEffect = <T extends readonly ParamFunction<any>[]>(args: {
  name: string;
  params: T;
  description: string;
  secondaryDescription?: string;
  fn: EffectFn<{ [P in keyof T]: ParamType<T[P]> }>;
  disabled?: boolean;
}): Effect<T> => ({
  name: args.name,
  params: args.params,
  description: args.description,
  secondaryDescription: args.secondaryDescription,
  fn: args.fn,
  disabled: args.disabled ?? false,
});
