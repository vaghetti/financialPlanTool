import { get } from "lodash";
import { Dispatch } from "react";
import { GlobalState } from "../App";
import { interestOptions } from "../businessLogic/interest";
import {
  findAllPeopleInSimulation,
  LifeEvent,
} from "../businessLogic/lifeEvents";

const customFormFieldList = ["money", "age", "interest", "person"] as const;
const fieldTypeList = [
  "text",
  "select",
  "number",
  "checkbox",
  ...customFormFieldList,
] as const;
type customFieldTypes = typeof customFormFieldList[number];
type fieldTypes = typeof fieldTypeList[number];

export interface FormFieldProps {
  dispatch: Dispatch<{ type: string; value: any; key: string }>;
  state: GlobalState;
  label: string;
  type: fieldTypes;
  fieldKey: string;
  defaultValue?: number | string;
  placeholder?: string;
  min?: number;
  max?: number;
  cols?: number;
  options?: string[] | readonly string[];
  year?: number;
}

type CustomFormFieldProps = FormFieldProps & {
  type: customFieldTypes;
};

function renderField(props: FormFieldProps) {
  if (customFormFieldList.includes(props.type as customFieldTypes)) {
    return renderCustomFieldType(props as CustomFormFieldProps);
  }
  return renderFormField(props);
}

function renderCustomFieldType(props: CustomFormFieldProps) {
  switch (props.type) {
    case "money":
      const propsMoney: FormFieldProps = {
        ...props,
        type: "number",
        placeholder: "R$ 123",
      };
      return renderFormField(propsMoney);
    case "age":
      const propsAge: FormFieldProps = {
        ...props,
        type: "number",
        placeholder: "34",
        min: 18,
        max: 100,
      };
      return renderFormField(propsAge);
    case "interest":
      const propsInterest: FormFieldProps = {
        ...props,
        type: "select",
        options: interestOptions,
      };
      return renderFormField(propsInterest);
    case "person":
      if (!props.year) {
        throw new Error("year is required for person field");
      }

      const people = findAllPeopleInSimulation(props.state.lifeEvents);
      const propsPerson: FormFieldProps = {
        ...props,
        type: "select",
        options: people,
      };
      return renderFormField(propsPerson);
    default:
      throw new Error("Unknown custom field type: " + props.type);
  }
}

function renderFormField(props: FormFieldProps) {
  // TODO: figure out why it looks so weird with 1
  const className = `w-fit  col-span-${2}`;

  return (
    <label className={className}>
      <span className="text-gray-700 w-full">{props.label}</span>
      {renderInnerElement(props)}
    </label>
  );
}

function renderInnerElement(props: FormFieldProps): JSX.Element {
  const className = "w-full mt-1 rounded-lg m-0 h-9";
  const value = get(props.state, props.fieldKey);
  switch (props.type) {
    case "select":
      const renderOptions = () => {
        return props.options?.map((option) => {
          return <option key={"option-" + option}>{option}</option>;
        });
      };
      return (
        <select
          className={"form-select " + className}
          value={value}
          onChange={(event) =>
            props.dispatch({
              type: "setValue",
              value: event.target.value,
              key: props.fieldKey,
            })
          }
        >
          {renderOptions()}
        </select>
      );
    default:
      return (
        <input
          onChange={(event) => {
            console.log(
              "updating value",
              props.fieldKey,
              "new value:",
              event.target.value
            );
            props.dispatch({
              type: "setValue",
              value: coerceTypes(props.type, event.target.value),
              key: props.fieldKey,
            });
          }}
          type={props.type}
          className={"form-input " + className}
          placeholder={props.placeholder}
          min={props.min}
          max={props.max}
          value={value}
        />
      );
  }
}

export default function FormField(props: FormFieldProps): JSX.Element {
  return renderField(props);
}

function coerceTypes(type: string, baseValue: any): any {
  switch (type) {
    case "money":
    case "number":
      return Number(baseValue);
    default:
      return baseValue;
  }
}
