export type ILabeled = { label: string };
export type ILabeledAny = { label: string; value: any };

export function makeLabeledAny(value: any | undefined, labelFunction: (value: any) => string): ILabeledAny | undefined {
  if (!value) return undefined;
  return { label: labelFunction(value), value: value };
}

export type INamed = { name: string };
