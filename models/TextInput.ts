import { InputTypes, TextBasedInput } from "./InputBase";
import { InputRules, InputNote, getMaxLength } from "./InputHelpers";
import { MultipleMarkdown } from "./MarkDown";

export interface TextInputBase extends TextBasedInput { }

export class TextInput implements TextInputBase {
  label: string;
  maxAttribute: string;
  inputType: InputTypes;
  rules: InputRules;
  isErrorState: boolean;
  readonly inputNotesAbove: MultipleMarkdown;
  readonly inputNotesBelow: MultipleMarkdown;
  inputNote?: InputNote;
  dependencies?: string[];
  defaultValue?: string;

  readonly maxLength: number;

  constructor(
    label: string,
    maxAttribute: string,
    inputType: InputTypes,
    rules: InputRules,
    maxLength: number,
    isErrorState: boolean,
    inputNotesAbove: MultipleMarkdown,
    inputNotesBelow: MultipleMarkdown,
    defaultValue?: string,
    inputNote?: InputNote | undefined,
    dependencies?: string[]
  ) {
    this.label = label;
    this.maxAttribute = maxAttribute;
    this.inputType = inputType;
    this.rules = rules;
    this.isErrorState = isErrorState;
    this.inputNotesAbove = inputNotesAbove;
    this.inputNotesBelow = inputNotesBelow;
    this.maxLength = getMaxLength(maxLength);
    this.defaultValue = defaultValue;
    this.inputNote = inputNote;
    this.dependencies = dependencies;
  }
}
