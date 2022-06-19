import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
} from "chart.js";
import { Line } from "react-chartjs-2";
import Block from "./Block";
import { GlobalState } from "../App";
import Form from "./Form";
import { DataSetBuilder } from "../businessLogic/dataSets";
import { interestOptionType } from "../businessLogic/interest";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export interface GraphSettingsData {
  inflationAdjustment: interestOptionType;
}

interface WealthGraphProps {
  state: GlobalState;
  dispatch: React.Dispatch<{ type: string; value: any; key: string }>;
}

export default function WealthGraph(props: WealthGraphProps) {
  const state = props.state;
  const dataSetBuilder = new DataSetBuilder(state);
  const { dataSets, labels } = dataSetBuilder.getAllDataSets();
  const data = {
    labels: labels,
    datasets: dataSets,
  };

  const graphOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: false,
      },
    },
    borderJoinStyle: "round",
  };

  return (
    <>
      <div className="col-span-1" />
      <Block className="col-span-10  h-full  items-center grid grid-cols-12">
        <>
          <Form
            className="col-span-12"
            dispatch={props.dispatch}
            state={state}
            fieldKeyPrefix="graphSettings"
            fields={[
              {
                fieldKey: "inflationAdjustment",
                label: "Ajuste de inflação",
                type: "interest",
                defaultValue: "IPCA",
              },
            ]}
          />
          {dataSets ? (
            <Line
              className="col-span-12 col-end-12 float-right"
              options={graphOptions}
              data={data}
            />
          ) : null}
        </>
      </Block>
    </>
  );
}
