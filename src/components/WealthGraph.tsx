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
import { SimulationSettingsData } from "./SimulationSettingsForm";
import Form from "./Form";
import { isArray, isNumber, isPlainObject, isString, sum } from "lodash";

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
  inflationAdjustment: string;
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
    <Block className="col-span-10 columns-12 h-fit  items-center grid grid-cols-12">
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
  );
}

interface DataSet {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
}

export class DataSetBuilder {
  constructor(private readonly state: GlobalState) {}

  public getAllDataSets(): { dataSets: DataSet[]; labels: string[] } {
    const { dataSets, labels } = this.generateRawDataSets();
    return {
      dataSets: dataSets.map((dataSet) => {
        return {
          ...dataSet,
          data: this.adjustTimeSeriesForInflation(dataSet.data).map((value) => {
            return value;
          }),
        };
      }),
      labels: labels,
    };
  }

  private generateRawDataSets(): { dataSets: DataSet[]; labels: string[] } {
    if (!this.allRequiredFieldsPresent()) {
      return { dataSets: [], labels: [] };
    }

    const years: number[] = [];
    const { simulationStart, simulationEnd } = this.state.settings;
    for (let year = simulationStart; year < simulationEnd; year++) {
      years.push(year);
    }
    const incomePerYear = this.computeIncomePerYear();
    const expensesPerYear = this.computeExpensesPerYear();
    const wealthPerYear = this.computeTotalWealthPerYear(
      incomePerYear,
      expensesPerYear
    );

    return {
      labels: years.map((year) => year.toString()),
      dataSets: [
        {
          label: "Renda",
          data: incomePerYear,
          borderColor: "rgb(0, 155, 0,0.5)",
          backgroundColor: "rgb(0, 155, 0,0.5)",
        },
        {
          label: "Despesas",
          data: expensesPerYear,
          borderColor: "rgb(155, 0, 0,0.5)",
          backgroundColor: "rgb(155, 0, 0,0.5)",
        },
        {
          label: "Patrimonio acumulado",
          data: wealthPerYear,
          borderColor: "rgb(0, 155, 0,1)",
          backgroundColor: "rgb(0, 155, 0,1)",
        },
      ],
    };
  }

  private allRequiredFieldsPresent(): boolean {
    // TODO: this is ridiculous! there's gotta be a better way than just doing this manually
    const ok =
      isPlainObject(this.state) &&
      isArray(this.state.adults) &&
      this.state.adults.length > 0 &&
      isPlainObject(this.state.graphSettings) &&
      isString(this.state.graphSettings.inflationAdjustment) &&
      isPlainObject(this.state.settings) &&
      isNumber(this.state.settings.simulationStart) &&
      isNumber(this.state.settings.simulationEnd) &&
      isNumber(this.state.costs.baseExpenses) &&
      isString(this.state.costs.baseExpensesYearlyAdjustment) &&
      isNumber(this.state.costs.shelterCost) &&
      isString(this.state.costs.shelterCostYearlyAdjustment);

    if (!ok) {
      console.log("Not ok yet! state:", this.state);
    }
    return ok;
  }

  private getInterestRate(
    option: string,
    settings: SimulationSettingsData
  ): number {
    switch (option) {
      case "IPCA":
        return settings.IPCA;
      case "IGPM":
        return settings.IGPM;
      case "Nenhum":
        return 0;
      default:
        // TODO handle other cases
        throw new Error("Unknown interest rate option: " + option);
    }
  }

  private computeIncomePerYear(): number[] {
    const incomePerYear: number[] = [];
    const { simulationStart, simulationEnd } = this.state.settings;
    for (let year = simulationStart; year < simulationEnd; year++) {
      let totalYearlyIncome = 0;
      this.state.adults.forEach((person) => {
        const age =
          year - this.state.settings.simulationStart + person.initialAge;
        if (age >= person.retirementAge || age < person.incomeStartAge) {
          return;
        }
        const income =
          this.applyInterest(
            person.startingIncome,
            person.afterTopOfCareerIncomeAdjustment,
            age - person.incomeStartAge
          ) * 12;
        totalYearlyIncome += income;
      });
      incomePerYear.push(totalYearlyIncome);
    }
    return incomePerYear;
  }

  private computeExpensesPerYear(): number[] {
    const expensesPerYear: number[] = [];
    const { simulationStart, simulationEnd } = this.state.settings;
    for (let year = simulationStart; year < simulationEnd; year++) {
      const yearsSinceStart = year - this.state.settings.simulationStart;
      const baseExpenses =
        this.applyInterest(
          this.state.costs.baseExpenses,
          this.state.costs.baseExpensesYearlyAdjustment,
          yearsSinceStart
        ) * 12;
      const costOfShelter =
        this.applyInterest(
          this.state.costs.shelterCost,
          this.state.costs.shelterCostYearlyAdjustment,
          yearsSinceStart
        ) * 12;
      expensesPerYear.push(baseExpenses + costOfShelter);
    }
    return expensesPerYear;
  }

  private computeTotalWealthPerYear(
    income: number[],
    expenses: number[]
  ): number[] {
    // TODO: people can marry at different points in time
    let wealth = sum(this.state.adults.map((person) => person.startingWealth));
    const totalWealthPerYear: number[] = [];
    for (let year = 0; year < income.length; year++) {
      totalWealthPerYear.push(wealth + income[year] - expenses[year]);
      wealth += income[year] - expenses[year];
      if (wealth > 0) {
        wealth = this.applyInterest(
          wealth,
          this.state.settings.portfolioYearlyReturn,
          1
        );
      }
    }
    return totalWealthPerYear;
  }

  private applyInterest(
    value: number,
    rate: string | number,
    years: number,
    negative: boolean = false
  ): number {
    if (isString(rate)) {
      rate = this.getInterestRate(rate, this.state.settings);
    }
    if (negative) {
      return value / Math.pow((100 + rate) / 100, years);
    }
    return value * Math.pow((100 + rate) / 100, years);
  }

  private adjustTimeSeriesForInflation(values: number[]): number[] {
    return values.map((value, years) => {
      return this.applyInterest(
        value,
        this.state.graphSettings.inflationAdjustment,
        years,
        true
      );
    });
  }
}
