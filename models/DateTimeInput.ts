import { InputBase, InputTypes } from "./InputBase";
import { InputRules, InputNote } from "./InputHelpers";
import { MultipleMarkdown } from "./MarkDown";

export interface DateTimeBase extends InputBase {
  readonly maxDate: Date;
  readonly minDate: Date;
}

export class DateTimeInput implements DateTimeBase {
  label: string;
  maxAttribute: string;
  inputType: InputTypes;
  rules: InputRules;
  isErrorState: boolean;
  readonly inputNotesAbove: MultipleMarkdown;
  readonly inputNotesBelow: MultipleMarkdown;
  defaultValue?: string;
  inputNote?: InputNote;
  dependencies?: string[];

  public readonly maxDate: Date;
  public readonly minDate: Date;

  constructor(
    label: string,
    maxAttribute: string,
    inputType: InputTypes,
    rules: InputRules,
    isErrorState: boolean,
    inputNotesAbove: MultipleMarkdown,
    inputNotesBelow: MultipleMarkdown,
    defaultValue?: string,
    inputNote?: InputNote,
    dependencies?: string[],
    minDate?: Date,
    maxDate?: Date
  ) {
    this.maxAttribute = maxAttribute;
    this.label = label;
    this.inputType = inputType;
    this.isErrorState = isErrorState;
    this.inputNotesAbove = inputNotesAbove;
    this.inputNotesBelow = inputNotesBelow;
    this.defaultValue = defaultValue;
    this.minDate = minDate as Date;
    this.maxDate = maxDate as Date;
    this.rules = rules;
    this.inputNote = inputNote;
    this.dependencies = dependencies;
  }
}
