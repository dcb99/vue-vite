export interface InputRules {
   required?: boolean;
   email?: boolean;
   submit?: boolean;
   readOnly?: boolean;
}

export interface InputNote {
  readonly text: string;
  readonly cssClass?: string;
}

export function getMaxLength(input: number) {
  return input && input > 0 ? input : Number.MAX_VALUE;
}
