import { Dispatch, useEffect } from "react";
import { GlobalState } from "../App";

const customFormFieldList = ["money", "age", "interest"];
type customFieldTypes = typeof customFormFieldList[number];

export interface FormFieldProps {
  dispatch: Dispatch<{ type: string; value: any; key: string }>;
  state: GlobalState;
  label: string;
  type: string;
  fieldKey: string;
  defaultValue?: number | string;
  placeholder?: string;
  min?: number;
  max?: number;
  cols?: number;
  options?: string[];
}

type CustomFormFieldProps = FormFieldProps & {
  type: customFieldTypes;
};

function renderField(props: FormFieldProps) {
  if (customFormFieldList.includes(props.type)) {
    return renderCustomFieldType(props);
  }
  return renderFormField(props);
}

function renderCustomFieldType(props: CustomFormFieldProps) {
  switch (props.type) {
    case "money":
      const propsMoney = {
        ...props,
        type: "number",
        placeholder: "R$ 123",
      };
      return renderFormField(propsMoney);
    case "age":
      const propsAge = {
        ...props,
        type: "number",
        placeholder: "34",
        min: 18,
        max: 100,
      };
      return renderFormField(propsAge);
    case "interest":
      const propsInterest = {
        value: "IPCA",
        ...props,
        placeholder: "IPCA",
        type: "select",
        options: ["Nenhum", "IPCA", "IGPM", "IPCA+1", "IPCA+2", "IPCA+3"],
      };
      return renderFormField(propsInterest);
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
          defaultValue={props.defaultValue}
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
          defaultValue={props.defaultValue}
        />
      );
  }
}

export default function FormField(props: FormFieldProps): JSX.Element {
  useEffect(() => {
    if (
      props.defaultValue &&
      !props.state.initializedKeys?.has(props.fieldKey)
    ) {
      props.dispatch({
        type: "setValue",
        value: coerceTypes(props.type, props.defaultValue),
        key: props.fieldKey,
      });
    }
  });
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
