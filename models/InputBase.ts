import { InputRules, InputNote } from "./InputHelpers";
import { MultipleMarkdown } from "./MarkDown";

export enum InputTypes {
  CheckBoxInputModel = "CheckBoxInputModel",
  DateInputModel = "DateInputModel",
  DatetimeInputModel = "DatetimeInputModel",
  DropDownInputModel = "DropDownInputModel",
  FileInputModel = "FileInputModel",
  NumberInputModel = "NumberInputModel",
  TextAreaInputModel = "TextAreaInputModel",
  TextInputModel = "TextInputModel",
  TextInputWithButtonModel = "TextInputWithButtonModel",
  RichTextInputModel = "RichTextInputModel"
}

export interface InputBase {
  readonly label: string;
  readonly maxAttribute: string;
  readonly inputType: InputTypes;
  readonly rules: InputRules;
  isErrorState: boolean;
  // eslint-disable-next-line
  readonly defaultValue?: any;
  readonly inputNote?: InputNote;
  readonly dependencies?: string[];
  isMultiPartInput?: boolean;
  isHighlighted?: boolean;
  readonly inputNotesAbove?: MultipleMarkdown;
  readonly inputNotesBelow?: MultipleMarkdown;
}

export interface TextBasedInput extends InputBase {
  readonly maxLength: number;
}
