import { Dispatch } from "react";
import { GlobalState } from "../App";
import Block from "./Block";
import Form, { FormProps } from "./Form";

export interface AdultData {
  name: string;
  startingWealth: number;
  initialAge: number;
  retirementAge: number;
  incomeStartAge: number;
  startingIncome: number;
  topOfCareerIncome: number;
  topOfCareerAge: number;
  afterTopOfCareerIncomeAdjustment: string;
}

interface AdultFormProps {
  adultIndex: number;
  state: GlobalState;
  dispatch: Dispatch<{ type: string; value: any; key: string }>;
}

export default function AdultForm(props: AdultFormProps) {
  const formProps: FormProps = {
    fieldKeyPrefix: "adults[" + props.adultIndex + "]",
    dispatch: props.dispatch,
    state: props.state,
    fields: [
      {
        fieldKey: "name",
        label: "Nome",
        type: "text",
        defaultValue: "João das Couves",
        cols: 2,
      },
      {
        fieldKey: "initialAge",
        label: "Idade no inicio da simulação",
        defaultValue: 20,
        type: "age",
      },
      {
        fieldKey: "incomeStartAge",
        label: "Idade de início do rendimento",
        defaultValue: 20,
        type: "age",
      },
      {
        fieldKey: "retirementAge",
        label: "Idade aposentadoria",
        type: "age",
        defaultValue: 70,
      },
      {
        fieldKey: "startingWealth",
        label: "Patrimonio liquido inicial (excl. imóveis)",
        type: "money",
        defaultValue: "10000",
      },
      {
        fieldKey: "startingIncome",
        label: "Salário líquido inicial",
        type: "money",
        defaultValue: "3000",
      },
      {
        fieldKey: "topOfCareerIncome",
        label: "Salário líquido topo de carreira",
        type: "money",
        defaultValue: "10000",
      },
      {
        fieldKey: "topOfCareerAge",
        label: "Idade topo de carreira",
        type: "age",
        defaultValue: "40",
      },
      {
        fieldKey: "afterTopOfCareerIncomeAdjustment",
        label: "Reajuste salário após topo de carreira",
        type: "interest",
        defaultValue: "IPCA",
      },
    ],
  };

  return (
    <Block className="col-span-3">
      <h1>Adulto</h1>
      <Form {...formProps} />
    </Block>
  );
}
