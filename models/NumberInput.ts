import { InputBase, InputTypes } from "./InputBase";
import { InputRules, InputNote } from "./InputHelpers";
import { MultipleMarkdown } from "./MarkDown";

export interface INumberInput extends InputBase {
  readonly minimum?: number;
  readonly maximum?: number;
  readonly requireInteger?: boolean;
}

export class NumberInput implements INumberInput {
  label: string;
  maxAttribute: string;
  inputType: InputTypes;
  rules: InputRules;
  isErrorState: boolean;
  readonly inputNotesAbove: MultipleMarkdown;
  readonly inputNotesBelow: MultipleMarkdown;
  inputNote?: InputNote;
  dependencies?: string[];
  defaultValue?: number;

  readonly minimum?: number;
  readonly maximum?: number;
  readonly requireInteger?: boolean = false;

  constructor(
    label: string,
    maxAttribute: string,
    inputType: InputTypes,
    rules: InputRules,
    isErrorState: boolean,
    inputNotesAbove: MultipleMarkdown,
    inputNotesBelow: MultipleMarkdown,
    defaultValue?: number,
    inputNote?: InputNote,
    dependencies?: string[],
    minimum?: number,
    maximum?: number,
    requireInteger?: boolean
  ) {
    this.label = label;
    this.maxAttribute = maxAttribute;
    this.inputType = inputType;
    this.isErrorState = isErrorState;
    this.inputNotesAbove = inputNotesAbove;
    this.inputNotesBelow = inputNotesBelow;
    this.defaultValue = defaultValue;
    this.rules = rules;
    this.inputNote = inputNote;
    this.dependencies = dependencies;
    this.minimum = minimum;
    this.maximum = maximum;
    this.requireInteger = requireInteger;
  }
}
