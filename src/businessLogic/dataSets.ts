import { GlobalState } from "../App";
import { applyInterest } from "./interest";
import {
  findSimulationSettings,
  processLifeEvents,
  SimulationSettings,
} from "./lifeEvents";

interface DataSet {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
}

export class DataSetBuilder {
  constructor(private readonly state: GlobalState) {}

  public getAllDataSets(): { dataSets: DataSet[]; labels: string[] } {
    const settings = findSimulationSettings(this.state.lifeEvents);
    const { dataSets, labels } = this.generateRawDataSets(settings);
    return {
      dataSets: dataSets.map((dataSet) => {
        return {
          ...dataSet,
          data: this.adjustTimeSeriesForInflation(dataSet.data, settings).map(
            (value) => {
              return value;
            }
          ),
        };
      }),
      labels: labels,
    };
  }

  private generateRawDataSets(settings: SimulationSettings): {
    dataSets: DataSet[];
    labels: string[];
  } {
    const years: number[] = [];
    const { year: simulationStart, simulationEnd } = settings;
    for (let year = simulationStart; year < simulationEnd; year++) {
      years.push(year);
    }
    const { incomePerYear, expensesPerYear, wealthPerYear } = processLifeEvents(
      this.state.lifeEvents
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

  private adjustTimeSeriesForInflation(
    values: number[],
    settings: SimulationSettings
  ): number[] {
    return values.map((value, years) => {
      return applyInterest(
        value,
        this.state.graphSettings.inflationAdjustment,
        years,
        settings,
        true
      );
    });
  }
}
