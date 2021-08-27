import { InputTypes, TextBasedInput } from "./InputBase";
import { Query } from "./Query";
import { InputRules, InputNote, getMaxLength } from "./InputHelpers";
import { LookupTableSearchProperties } from './MiscTypes';
import { MultipleMarkdown } from "./MarkDown";

export interface TextInputWithButtonBase extends TextBasedInput {
  valueToSubmit: string;
  query: Query;
  lookupTableSearchProperties?: LookupTableSearchProperties;
}

export class TextInputWithButton implements TextInputWithButtonBase {
  label: string;
  maxAttribute: string;
  inputType: InputTypes;
  rules: InputRules;
  valueToSubmit: string;
  query: Query;
  maxLength: number;
  isErrorState: boolean;
  readonly inputNotesAbove: MultipleMarkdown;
  readonly inputNotesBelow: MultipleMarkdown;
  defaultValue?: string;
  inputNote?: InputNote;
  dependencies?: string[];
  searchDependencies?: LookupTableSearchProperties;

  constructor(
    label: string,
    maxAttribute: string,
    inputType: InputTypes,
    rules: InputRules,
    maxLength: number,
    valueToSubmit: string,
    query: Query,
    isErrorState: boolean,
    inputNotesAbove: MultipleMarkdown,
    inputNotesBelow: MultipleMarkdown,
    defaultValue?: string,
    inputNote?: InputNote,
    dependencies?: string[],
    searchDependencies?: LookupTableSearchProperties
  ) {
    this.label = label;
    this.maxAttribute = maxAttribute;
    this.inputType = inputType;
    this.rules = rules;
    this.isErrorState = isErrorState;
    this.inputNotesAbove = inputNotesAbove;
    this.inputNotesBelow = inputNotesBelow;
    this.maxLength = getMaxLength(maxLength);
    this.valueToSubmit = valueToSubmit;
    this.query = query;
    this.defaultValue = defaultValue;
    this.inputNote = inputNote;
    this.dependencies = dependencies;
    this.searchDependencies = searchDependencies;
  }
}
