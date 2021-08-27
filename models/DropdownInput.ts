import { InputBase, InputTypes } from "./InputBase";
import { InputRules, InputNote } from "./InputHelpers";
import { MultipleMarkdown } from "./MarkDown";
export interface DropdownBase extends InputBase {
  readonly valueToSubmit: string;
}

export class DropdownInput implements DropdownBase {
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

  readonly valueToSubmit: string;

  constructor(
    label: string,
    maxAttribute: string,
    inputType: InputTypes,
    rules: InputRules,
    isErrorState: boolean,
    inputNotesAbove: MultipleMarkdown,
    inputNotesBelow: MultipleMarkdown,
    valueToSubmit: string,
    defaultValue?: string,
    inputNote?: InputNote,
    dependencies?: string[]
  ) {
    this.label = label;
    this.maxAttribute = maxAttribute;
    this.inputType = inputType;
    this.isErrorState = isErrorState;
    this.inputNotesAbove = inputNotesAbove;
    this.inputNotesBelow = inputNotesBelow;
    this.valueToSubmit = valueToSubmit;
    this.defaultValue = defaultValue;
    this.rules = rules;
    this.inputNote = inputNote;
    this.dependencies = dependencies;
  }
}
