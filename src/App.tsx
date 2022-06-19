import { cloneDeep, get, set } from "lodash";
import React, { useReducer } from "react";
import "./App.css";
import {
  getLifeEventTypeData,
  LifeEvent,
  LifeEventType,
} from "./businessLogic/lifeEvents";
import AddEventButton from "./components/AddEventButton";

import Timeline from "./components/Timeline";
import Graph, { GraphSettingsData } from "./components/WealthGraph";

export interface GlobalState {
  graphSettings: GraphSettingsData;
  initializedKeys: Set<string>;
  lifeEvents: LifeEvent[];
}

function reducer(
  state: GlobalState,
  action: { type: string; value: any; key?: string }
): GlobalState {
  if (
    action.type === "setValue" &&
    action.key &&
    get(state, action.key) === action.value
  ) {
    return state;
  }

  const newState = cloneDeep(state);
  switch (action.type) {
    case "setValue":
      if (!action.key) {
        throw new Error("setValue action requires key");
      }
      set(newState, action.key, action.value);
      if (newState.initializedKeys === undefined) {
        newState.initializedKeys = new Set();
      }
      newState.initializedKeys.add(action.key);
      break;
    case "addLifeEvent":
      newState.lifeEvents.push(action.value);
      break;
    default:
      throw new Error("Unknown action type: " + action.type);
  }
  return newState;
}

function App() {
  const defaultEventTypes: LifeEventType[] = [
    "birth",
    "simulationStart",
    "professionalCareerStart",
    "startCoveringOwnExpenses",
    "moveIntoRentedApartment",
    "marriage",
    "retirement",
  ];
  const initialState: GlobalState = {
    graphSettings: {
      inflationAdjustment: "IPCA",
    },
    lifeEvents: defaultEventTypes.map(
      (type) => getLifeEventTypeData(type).defaultEvent
    ),
  } as GlobalState; //FormField effects will fill all of these
  const [globalState, dispatch] = useReducer(reducer, initialState);
  return (
    <div className="w-screen h-screen grid grid-cols-12">
      <Graph state={globalState} dispatch={dispatch} />
      <Timeline
        lifeEvents={globalState.lifeEvents}
        dispatch={dispatch}
        state={globalState}
      />
      <AddEventButton dispatch={dispatch} state={globalState} />
    </div>
  );
}

export default App;
