import { InputBase, InputTypes } from "./InputBase";
import { InputRules, InputNote } from "./InputHelpers";
import { MultipleMarkdown } from "./MarkDown";

export interface DateInputBase extends InputBase {
    readonly maxDate?: string;
    readonly minDate?: string;
}

export class DateInput implements DateInputBase {
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

    public readonly maxDate?: string;
    public readonly minDate?: string;

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
        minDate?: string,
        maxDate?: string
    ) {
        this.maxAttribute = maxAttribute;
        this.label = label;
        this.inputType = inputType;
        this.isErrorState = isErrorState;
        this.inputNotesAbove = inputNotesAbove;
        this.inputNotesBelow = inputNotesBelow;
        this.defaultValue = defaultValue;
        this.minDate = minDate;
        this.maxDate = maxDate;
        this.rules = rules;
        this.inputNote = inputNote;
        this.dependencies = dependencies;
    }
}