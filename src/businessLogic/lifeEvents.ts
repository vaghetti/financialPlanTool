import { applyInterest, interestOptionType } from "./interest";
import { MdApartment, MdWork } from "react-icons/md";
import {
  FaBirthdayCake,
  FaHeart,
  FaHouseUser,
  FaPlay,
  FaUmbrellaBeach,
} from "react-icons/fa";
import { GiMoneyStack } from "react-icons/gi";

const dummyName1 = "João das Couves";
const dummyName2 = "Maria das Couves";

export type LifeEvent = {
  year: number;
} & (
  | {
      type: "simulationStart";
      simulationEnd: number;
      startingWealth: number;
      investmentYearlyReturn: number;
      IPCA: number;
      IGPM: number;
    }
  | {
      type: "birth";
      name: string;
    }
  | {
      type: "professionalCareerStart";
      personName: string;
      startingMonthlySalary: number;
      topOfLadderSalary: number;
      yearsUntilTopOfLadder: number;
      salaryAdjustmentAfterTopOfLadder: interestOptionType;
    }
  | {
      type: "retirement";
      personName: string;
      // TODO INSS etc
    }
  | {
      type: "marriage";
      partnerName: string;
      weddingCost: number;
      partnerInitialWealth: number;
      additionalLivingCost: number;
      additionalLivingCostYearlyAdjustment: interestOptionType;
    }
  | {
      type: "startCoveringOwnExpenses";
      monthlyLivingCosts: number; //excluding rent/mortgage
      livingCostsYearlyAdjustment: interestOptionType;
    }
  | {
      type: "moveIntoRentedApartment";
      rent: number;
      rentYearlyAdjustment: interestOptionType;
    }
  | {
      type: "moveIntoOwnApartment";
      // TODO mortgage
      isMortgaged: false;
      fullPrice: number;
    }
);

export type LifeEventType = LifeEvent["type"];

export function getLifeEventTypeData(type: LifeEventType): {
  label: string;
  icon: JSX.Element;
  defaultEvent: LifeEvent;
  required?: boolean;
  enableFunc?: (existingEvents: LifeEvent[]) => boolean;
} {
  switch (type) {
    case "simulationStart":
      return {
        label: "Início da simulação",
        icon: FaPlay({}),
        required: true,
        defaultEvent: {
          type: "simulationStart",
          simulationEnd: 2085,
          IGPM: 7.67,
          IPCA: 6.25,
          investmentYearlyReturn: 11.5,
          startingWealth: 1000,
          year: new Date().getFullYear(),
        },
      };
    case "birth":
      return {
        label: "Nascimento",
        icon: FaBirthdayCake({}),
        defaultEvent: {
          type: "birth",
          name: dummyName1,
          year: 1990,
        },
        required: true,
      };
    case "professionalCareerStart":
      return {
        label: "Início da carreira profissional",
        icon: MdWork({}),
        defaultEvent: {
          type: "professionalCareerStart",
          personName: dummyName1,
          salaryAdjustmentAfterTopOfLadder: "IPCA",
          startingMonthlySalary: 2500,
          topOfLadderSalary: 10000,
          year: new Date().getFullYear(),
          yearsUntilTopOfLadder: 20,
        },
        enableFunc: (existingEvents: LifeEvent[]): boolean => {
          const unemployedAdults = existingEvents.filter((event) => {
            let personName: string | undefined = undefined;
            if (event.type === "birth") {
              personName = event.name;
            }
            if (event.type === "marriage") {
              personName = event.partnerName;
            }
            return (
              personName &&
              !existingEvents.some(
                (e) =>
                  e.type === "professionalCareerStart" &&
                  e.personName === personName
              )
            );
          });
          // Can only start a professional career if there's at least 1 unemployed adult
          return unemployedAdults.length > 0;
        },
      };
    case "retirement":
      return {
        label: "Aposentadoria",
        icon: FaUmbrellaBeach({}),
        defaultEvent: {
          type: "retirement",
          personName: dummyName1,
          year: 2055,
        },
        enableFunc: (existingEvents: LifeEvent[]): boolean => {
          const activelyWorkingPeople = existingEvents.filter((event) => {
            if (event.type === "professionalCareerStart") {
              // person is working, make sure retirement event doesn't exist already
              return !existingEvents.some((e) => {
                const isRetirement =
                  e.type === "retirement" && e.personName === event.personName;
                if (!isRetirement) {
                  console.log("not retirement", e, event);
                }
                return isRetirement;
              });
            }
            return false;
          });
          console.log("actively working people", activelyWorkingPeople);
          return activelyWorkingPeople.length > 0;
        },
      };
    case "marriage":
      return {
        label: "Casamento",
        icon: FaHeart({}),
        defaultEvent: {
          type: "marriage",
          additionalLivingCost: 500,
          additionalLivingCostYearlyAdjustment: "IPCA",
          partnerInitialWealth: 1000,
          partnerName: dummyName2,
          weddingCost: 5000,
          year: 2025,
        },
        enableFunc: (existingEvents: LifeEvent[]): boolean => {
          // can only have 1 marriage event
          // TODO(?): support for non-monogamy
          return existingEvents.every((e) => e.type !== "marriage");
        },
      };
    case "startCoveringOwnExpenses":
      return {
        label: "Começar a cobrir gastos próprios",
        icon: GiMoneyStack({}),
        defaultEvent: {
          type: "startCoveringOwnExpenses",
          monthlyLivingCosts: 1000,
          livingCostsYearlyAdjustment: "IPCA",
          year: new Date().getFullYear(),
        },
        enableFunc: (existingEvents: LifeEvent[]): boolean => {
          // can only start covering expenses once
          return existingEvents.every(
            (e) => e.type !== "startCoveringOwnExpenses"
          );
        },
      };
    case "moveIntoRentedApartment":
      return {
        label: "Mudança para casa alugada",
        icon: MdApartment({}),
        defaultEvent: {
          type: "moveIntoRentedApartment",
          rent: 500,
          rentYearlyAdjustment: "IGPM",
          year: new Date().getFullYear(),
        },
        enableFunc: (existingEvents: LifeEvent[]): boolean => {
          // can only move into rented place once
          // TODO: support going back and forth on bought vs rent?
          return existingEvents.every(
            (e) => e.type !== "startCoveringOwnExpenses"
          );
        },
      };
    case "moveIntoOwnApartment":
      return {
        label: "Mudança para casa própria",
        icon: FaHouseUser({}),
        defaultEvent: {
          type: "moveIntoOwnApartment",
          fullPrice: 200000,
          year: 2030,
          isMortgaged: false,
        },
        enableFunc: (existingEvents: LifeEvent[]): boolean => {
          // can only move into owned place once
          // TODO: support going back and forth on bought vs rent?
          return existingEvents.every((e) => e.type !== "moveIntoOwnApartment");
        },
      };
  }
}

export type SimulationSettings = LifeEvent & {
  type: "simulationStart";
};

interface LifeEventOutput {
  income?: number;
  expense?: number;
  wealthChange?: number;
}

export function processLifeEvents(lifeEvents: LifeEvent[]): {
  incomePerYear: number[];
  expensesPerYear: number[];
  wealthPerYear: number[];
} {
  const wealthPerYear: number[] = [];
  const incomePerYear: number[] = [];
  const expensesPerYear: number[] = [];

  const simulationSettings = findSimulationSettings(lifeEvents);

  const { year: simulationStart, simulationEnd } = simulationSettings;
  let wealth = 0;
  for (let year = simulationStart; year < simulationEnd; year++) {
    let yearWealthChange = 0;
    let yearExpenses = 0;
    let yearIncome = 0;
    for (const event of lifeEvents) {
      let { expense, income, wealthChange } = processLifeEvent(
        year,
        event,
        lifeEvents,
        simulationSettings
      );
      yearWealthChange += wealthChange || 0;
      yearExpenses += expense || 0;
      yearIncome += income || 0;
    }

    wealth += yearWealthChange;
    const investmentInterest =
      applyInterest(
        wealth,
        simulationSettings.investmentYearlyReturn,
        1,
        simulationSettings
      ) - wealth;
    yearIncome += investmentInterest;
    wealth += +(yearIncome || 0) - (yearExpenses || 0);
    wealthPerYear.push(wealth);
    incomePerYear.push(yearIncome);
    expensesPerYear.push(yearExpenses);
  }
  return {
    incomePerYear,
    expensesPerYear,
    wealthPerYear,
  };
}

export function processLifeEvent(
  year: number,
  event: LifeEvent,
  eventList: LifeEvent[],
  settings: SimulationSettings
): LifeEventOutput {
  switch (event.type) {
    case "simulationStart":
      return {
        wealthChange: year === event.year ? event.startingWealth : 0,
      };
    case "birth":
      return {};
    case "professionalCareerStart":
      return processProfessionalCareerEvent(year, event, eventList, settings);
    case "retirement":
      return {};
    case "marriage":
      return processMarriageEvent(year, event, settings);
    case "startCoveringOwnExpenses":
      return processStartCoveringOwnExpenses(year, event, settings);
    case "moveIntoRentedApartment":
      return moveIntoRentedApartment(year, event, settings);
    case "moveIntoOwnApartment":
      return {
        expense: year === event.year ? event.fullPrice : 0,
        wealthChange: year === event.year ? event.fullPrice : 0,
      };
  }
}

function processProfessionalCareerEvent(
  year: number,
  event: LifeEvent,
  eventList: LifeEvent[],
  settings: SimulationSettings
): LifeEventOutput {
  if (event.type !== "professionalCareerStart") {
    throw new Error(
      "Invalid event type! must a be a professionalCareerStart event"
    );
  }

  const retirementYear = findRetirementYear(event, eventList);
  if (year < event.year || year >= retirementYear) {
    return {};
  }

  return {
    income:
      applyInterest(
        event.startingMonthlySalary,
        event.salaryAdjustmentAfterTopOfLadder,
        year - event.year,
        settings
      ) * 12,
  };
}

function findRetirementYear(
  careerStartEvent: LifeEvent,
  eventList: LifeEvent[]
): number {
  if (careerStartEvent.type !== "professionalCareerStart") {
    throw new Error(
      "Invalid event type! must a be a professionalCareerStart event"
    );
  }
  for (const event of eventList) {
    if (
      event.type === "retirement" &&
      careerStartEvent.personName === event.personName
    ) {
      return event.year;
    }
  }
  // no matching retirement found, so no retirement
  return Number.POSITIVE_INFINITY;
}

export function findSimulationSettings(
  eventList: LifeEvent[]
): SimulationSettings {
  for (const event of eventList) {
    if (event.type === "simulationStart") {
      return event;
    }
  }
  throw new Error("No simulationStart event found");
}

export function findAllPeopleInSimulation(eventList: LifeEvent[]): string[] {
  const people: string[] = [];
  for (const event of eventList) {
    if (event.type === "birth") {
      people.push(event.name);
    }
    if (event.type === "marriage") {
      people.push(event.partnerName);
    }
  }
  return people;
}

function processMarriageEvent(
  year: number,
  event: LifeEvent,
  settings: SimulationSettings
): LifeEventOutput {
  if (event.type !== "marriage") {
    throw new Error("Invalid event type! must a be a marriage event");
  }

  let expense = 0;
  if (year === event.year) {
    expense = event.weddingCost;
  }

  if (year >= event.year) {
    expense +=
      applyInterest(
        event.additionalLivingCost,
        event.additionalLivingCostYearlyAdjustment,
        year - settings.year,
        settings
      ) * 12;
  }

  return {
    wealthChange: event.partnerInitialWealth,
    expense: expense,
  };
}

function processStartCoveringOwnExpenses(
  year: number,
  event: LifeEvent,
  settings: SimulationSettings
): LifeEventOutput {
  if (event.type !== "startCoveringOwnExpenses") {
    throw new Error(
      "Invalid event type! must a be a startCoveringOwnExpenses event"
    );
  }
  if (year < event.year) {
    return {};
  }
  return {
    expense:
      applyInterest(
        event.monthlyLivingCosts,
        event.livingCostsYearlyAdjustment,
        year - event.year,
        settings
      ) * 12,
  };
}

function moveIntoRentedApartment(
  year: number,
  event: LifeEvent,
  settings: SimulationSettings
): LifeEventOutput {
  if (event.type !== "moveIntoRentedApartment") {
    throw new Error(
      "Invalid event type! must a be a moveIntoOwnApartment event"
    );
  }
  if (year < event.year) {
    return {};
  }
  return {
    expense:
      applyInterest(
        event.rent,
        event.rentYearlyAdjustment,
        year - event.year,
        settings
      ) * 12,
  };
}
