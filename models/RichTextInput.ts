import { InputTypes, InputBase } from "./InputBase";
import { InputRules, InputNote } from "./InputHelpers";
import { MultipleMarkdown } from "./MarkDown";

export class RichTextInput implements InputBase {
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

  constructor(
    label: string,
    maxAttribute: string,
    inputType: InputTypes,
    rules: InputRules,
    isErrorState: boolean,
    inputNotesAbove: MultipleMarkdown,
    inputNotesBelow: MultipleMarkdown,
    // The rich text input will most often be used for description_longdescription fields, which 
    // technically have no maximum, so the default maxLength should be the max that JS can handle.
    maxLength: number = Number.MAX_SAFE_INTEGER,
    defaultValue?: string,
    inputNote?: InputNote,
    dependencies?: string[]
  ) {
    this.label = label;
    this.maxAttribute = maxAttribute;
    this.inputType = inputType;
    this.rules = rules;
    this.isErrorState = isErrorState;
    this.inputNotesAbove = inputNotesAbove;
    this.inputNotesBelow = inputNotesBelow;
    this.maxLength = maxLength;
    this.defaultValue = defaultValue;
    this.inputNote = inputNote;
    this.dependencies = dependencies;
  }
}