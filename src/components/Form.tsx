import { Dispatch } from "react";
import { GlobalState } from "../App";
import FormField, { FormFieldProps } from "./FormField";

export type FormPropFields = Array<Omit<FormFieldProps, "dispatch" | "state">>;

export interface FormProps {
  fieldKeyPrefix: string;
  fields: FormPropFields;
  className?: string;
  state: GlobalState;
  dispatch: Dispatch<{ type: string; value: any; key: string }>;
}

export default function Form(props: FormProps) {
  const keys = props.fields.map(
    (field) => props.fieldKeyPrefix + "." + field.fieldKey
  );
  return (
    <div className={(props.className ?? "") + "grid grid-cols-2 gap-2"}>
      {props.fields.map((field, index) => (
        <FormField
          {...field}
          key={keys[index]}
          fieldKey={keys[index]}
          dispatch={props.dispatch}
          state={props.state}
        />
      ))}
    </div>
  );
}
