import type {
  ParamFunction,
  EffectFn,
  Effect,
  ParamType,
  EffectGroup,
} from '~/domain/types';

export const buildEffect = <T extends readonly ParamFunction<any>[]>(args: {
  name: string;
  group: EffectGroup;
  params: T;
  description: string;
  secondaryDescription?: string;
  fn: EffectFn<{ [P in keyof T]: ParamType<T[P]> }>;
  disabled?: boolean;
  groupOrder?: number;
  requiresAnimation?: true;
}): Effect<T> => ({
  name: args.name,
  group: args.group,
  params: args.params,
  description: args.description,
  secondaryDescription: args.secondaryDescription,
  fn: args.fn,
  disabled: args.disabled ?? false,
  groupOrder: args.groupOrder,
  requiresAnimation: args.requiresAnimation,
});
