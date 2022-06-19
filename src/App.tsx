import { cloneDeep, get, set } from "lodash";
import React, { useReducer } from "react";
import "./App.css";
import Adult from "./components/AdultForm";
import { AdultData } from "./components/AdultForm";
import CostSettingsForm, {
  CostSettingsData,
} from "./components/CostSettingsForm";

import SimulationSettingsForm, {
  SimulationSettingsData,
} from "./components/SimulationSettingsForm";
import Graph, { GraphSettingsData } from "./components/WealthGraph";

export interface GlobalState {
  settings: SimulationSettingsData;
  costs: CostSettingsData;
  graphSettings: GraphSettingsData;
  adults: AdultData[];
  initializedKeys: Set<string>;
}

function reducer(
  state: GlobalState,
  action: { type: string; value: any; key: string }
): GlobalState {
  if (action.type === "setValue" && get(state, action.key) === action.value) {
    return state;
  }
  // console.log(
  //   "reducer triggering update, key",
  //   action.key,
  //   "changed from ",
  //   get(state, action.key),
  //   "to ",
  //   action.value
  // );

  const newState = cloneDeep(state);
  switch (action.type) {
    case "setValue":
      set(newState, action.key, action.value);
      if (newState.initializedKeys === undefined) {
        newState.initializedKeys = new Set();
      }
      newState.initializedKeys.add(action.key);
      break;
    default:
      throw new Error("Unknown action type: " + action.type);
  }
  return newState;
}

function App() {
  const initialState: GlobalState = {
    adults: [],
    costs: {},
    settings: {},
  } as unknown as GlobalState; //FormField effects will fill all of these
  const [globalState, dispatch] = useReducer(reducer, initialState);
  return (
    <div className="bg-slate-600 w-screen h-screen grid grid-cols-12">
      <Graph state={globalState} dispatch={dispatch} />
      <SimulationSettingsForm dispatch={dispatch} state={globalState} />
      <CostSettingsForm dispatch={dispatch} state={globalState} />
      <Adult dispatch={dispatch} adultIndex={0} state={globalState} />
    </div>
  );
}

export default App;
