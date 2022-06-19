import { Dispatch } from "react";
import { GlobalState } from "../App";
import Block from "./Block";
import Form, { FormProps } from "./Form";

export interface CostSettingsData {
  shelterCost: number;
  shelterCostYearlyAdjustment: string;
  baseExpenses: number;
  baseExpensesYearlyAdjustment: string;
}

interface CostSettingsProps {
  state: GlobalState;
  dispatch: Dispatch<{ type: string; value: any; key: string }>;
}

export default function CostSettingsForm(props: CostSettingsProps) {
  const formProps: FormProps = {
    fieldKeyPrefix: "costs",
    state: props.state,
    dispatch: props.dispatch,
    fields: [
      {
        fieldKey: "baseExpenses",
        label: "Custo de vida (excl. aluguel) (R$/mês)",
        defaultValue: "1000",
        type: "money",
      },
      {
        fieldKey: "baseExpensesYearlyAdjustment",
        label: "Aumento anual do custo de vida",
        type: "interest",
        defaultValue: "IPCA",
      },
      {
        fieldKey: "shelterCost",
        label: "Custo de moradia (R$/mes)",
        defaultValue: "1000",
        type: "money",
      },
      {
        fieldKey: "shelterCostYearlyAdjustment",
        label: "Ajuste anual do custo de moradia",
        defaultValue: "IGPM",
        type: "interest",
      },
    ],
  };
  return (
    <Block className="col-span-3">
      <h1>Custos</h1>
      <Form {...formProps} />
    </Block>
  );
}
