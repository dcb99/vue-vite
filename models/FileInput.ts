import { InputBase, InputTypes } from "./InputBase";
import { InputRules, InputNote } from "./InputHelpers";
import { MultipleMarkdown } from "./MarkDown";

export interface FileInputBase extends InputBase {
  readonly allowableFileTypes: string[];
  readonly maxFileSize: number;
}

export class FileInput implements FileInputBase {
  label: string;
  maxAttribute: string;
  inputType: InputTypes;
  rules: InputRules;
  isErrorState: boolean;
  readonly inputNotesAbove: MultipleMarkdown;
  readonly inputNotesBelow: MultipleMarkdown;
  inputNote?: InputNote;
  dependencies?: string[];
  cssClass?: string[];

  readonly allowableFileTypes: string[];
  readonly maxFileSize: number;

  constructor(
    label: string,
    maxAttribute: string,
    inputType: InputTypes,
    rules: InputRules,
    allowableFileTypes: string[],
    maxFileSize: number,
    isErrorState: boolean,
    inputNotesAbove: MultipleMarkdown,
    inputNotesBelow: MultipleMarkdown,
    inputNote?: InputNote,
    dependencies?: string[]
  ) {
    this.label = label;
    this.maxAttribute = maxAttribute;
    this.inputType = inputType;
    this.isErrorState = isErrorState;
    this.inputNotesAbove = inputNotesAbove;
    this.inputNotesBelow = inputNotesBelow;
    this.allowableFileTypes = allowableFileTypes;
    this.maxFileSize = maxFileSize;
    this.rules = rules;
    this.inputNote = inputNote;
    this.dependencies = dependencies;
  }
}
