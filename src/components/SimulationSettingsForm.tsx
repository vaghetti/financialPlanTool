import { Dispatch } from "react";
import { GlobalState } from "../App";
import Block from "./Block";
import Form, { FormProps } from "./Form";

export interface SimulationSettingsData {
  IPCA: number;
  IGPM: number;
  portfolioYearlyReturn: number;
  simulationStart: number;
  simulationEnd: number;
}

export interface SimulationSettingsProps {
  state: GlobalState;
  dispatch: Dispatch<{ type: string; value: any; key: string }>;
}

export default function SimulationSettings(props: SimulationSettingsProps) {
  const formProps: FormProps = {
    fieldKeyPrefix: "settings",
    dispatch: props.dispatch,
    state: props.state,
    fields: [
      {
        fieldKey: "IPCA",
        label: "IPCA (%/ano)",
        type: "number",
        defaultValue: "6.25",
      },
      {
        fieldKey: "IGPM",
        label: "IGPM (%/ano)",
        type: "number",
        defaultValue: "7.67",
      },
      {
        fieldKey: "portfolioYearlyReturn",
        label: "Rendimento dos investimentos (%/ano)",
        type: "number",
        defaultValue: "8.00",
      },
      {
        fieldKey: "simulationStart",
        label: "Inicio da simulação",
        type: "number",
        defaultValue: "2022",
      },
      {
        fieldKey: "simulationEnd",
        label: "Fim da simulação",
        type: "number",
        defaultValue: "2093",
      },
    ],
  };
  return (
    <Block className="col-span-3">
      <h1>Configurações</h1>
      <Form {...formProps} />
    </Block>
  );
}
