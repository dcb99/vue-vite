import { InputTypes, TextBasedInput } from "./InputBase";
import { InputRules, InputNote, getMaxLength } from "./InputHelpers";
import { MultipleMarkdown } from "./MarkDown";

export interface TextAreaBase extends TextBasedInput {
  richText: boolean;
}

export class TextAreaInput implements TextAreaBase {
  label: string;
  maxAttribute: string;
  inputType: InputTypes;
  rules: InputRules;
  isErrorState: boolean;
  readonly inputNotesAbove: MultipleMarkdown;
  readonly inputNotesBelow: MultipleMarkdown;
  maxLength: number;
  defaultValue?: any;
  inputNote?: InputNote;
  dependencies?: string[];

  richText: boolean;

  constructor(
    label: string,
    maxAttribute: string,
    inputType: InputTypes,
    rules: InputRules,
    maxLength: number,
    richText: boolean,
    isErrorState: boolean,
    inputNotesAbove: MultipleMarkdown,
    inputNotesBelow: MultipleMarkdown,
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
    this.rules = rules;
    this.maxLength = getMaxLength(maxLength);
    this.richText = richText;
    this.defaultValue = defaultValue;
    this.inputNote = inputNote;
    this.dependencies = dependencies;
  }
}
