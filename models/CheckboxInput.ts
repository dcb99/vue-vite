import { InputBase, InputTypes } from "./InputBase";
import { InputRules, InputNote } from "./InputHelpers";
import { MultipleMarkdown } from "./MarkDown";

export class CheckBoxInput implements InputBase {
  label: string;
  maxAttribute: string;
  inputType: InputTypes;
  rules: InputRules;
  isErrorState: boolean;
  readonly inputNotesAbove: MultipleMarkdown;
  readonly inputNotesBelow: MultipleMarkdown;
  defaultValue?: boolean;
  inputNote?: InputNote;
  dependencies?: string[];

  constructor(
    label: string,
    maxAttribute: string,
    inputType: InputTypes,
    rules: InputRules,
    isErrorState: boolean,
    inputNotesAbove: MultipleMarkdown,
    inputNotesBelow: MultipleMarkdown,
    defaultValue?: boolean,
    inputNote?: InputNote,
    dependencies?: string[]
  ) {
    this.maxAttribute = maxAttribute;
    this.label = label;
    this.inputType = inputType;
    this.defaultValue = defaultValue;
    this.rules = rules;
    this.isErrorState = isErrorState;
    this.inputNotesAbove = inputNotesAbove;
    this.inputNotesBelow = inputNotesBelow;
    this.inputNote = inputNote;
    this.dependencies = dependencies;
  }
}
