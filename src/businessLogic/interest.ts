import { isString } from "lodash";
import { SimulationSettings } from "./lifeEvents";

export const interestOptions = [
  "Nenhum",
  "IPCA",
  "IGPM",
  "IPCA+1",
  "IPCA+2",
  "IPCA+3",
  "IGPM+1",
  "IGPM+2",
  "IGPM+3",
] as const;

export type interestOptionType = typeof interestOptions[number];

export function applyInterest(
  value: number,
  rate: number | interestOptionType,
  years: number,
  settings: SimulationSettings,
  negative: boolean = false
): number {
  if (isString(rate)) {
    rate = getInterestRate(rate, settings);
  }
  if (negative) {
    return value / Math.pow((100 + rate) / 100, years);
  }
  return value * Math.pow((100 + rate) / 100, years);
}

function getInterestRate(
  option: interestOptionType,
  settings: SimulationSettings
): number {
  switch (option) {
    case "IPCA":
      return settings.IPCA;
    case "IGPM":
      return settings.IGPM;
    case "Nenhum":
      return 0;
    case "IPCA+1":
      return settings.IPCA + 1;
    case "IPCA+2":
      return settings.IPCA + 2;
    case "IPCA+3":
      return settings.IPCA + 3;
    case "IGPM+1":
      return settings.IGPM + 1;
    case "IGPM+2":
      return settings.IGPM + 2;
    case "IGPM+3":
      return settings.IGPM + 3;
    default:
      // TODO handle other cases
      throw new Error("Unknown interest rate option: " + option);
  }
}
