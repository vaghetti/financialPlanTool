import { Dispatch } from "react";
import { MdAdd } from "react-icons/md";
import { Fab, Action } from "react-tiny-fab";
import "react-tiny-fab/dist/styles.css";
import { GlobalState } from "../App";
import {
  getLifeEventTypeData,
  LifeEventType,
} from "../businessLogic/lifeEvents";

// Not all event types are covered here, only
const nonRequiredEvents: LifeEventType[] = [
  "professionalCareerStart",
  "retirement",
  "marriage",
  "startCoveringOwnExpenses",
  "moveIntoRentedApartment",
  "moveIntoOwnApartment",
];

export interface AddEventButtonProps {
  state: GlobalState;
  dispatch: Dispatch<{ type: string; value: any; key?: string }>;
}

export default function AddEventButton(props: AddEventButtonProps) {
  const creatableEvents = getCreatableEvents(props.state);
  return (
    <Fab icon={<MdAdd />} alwaysShowTitle={true}>
      {creatableEvents.map((eventType, index) => {
        const { label, icon } = getLifeEventTypeData(eventType);
        return (
          <Action
            key={index}
            text={label}
            onClick={() => {
              props.dispatch({
                type: "addLifeEvent",
                value: {
                  type: eventType,
                  year: new Date().getFullYear(),
                },
              });
            }}
          >
            {icon}
          </Action>
        );
      })}
    </Fab>
  );
}

function getCreatableEvents(state: GlobalState): LifeEventType[] {
  return nonRequiredEvents.filter((event) => {
    const { enableFunc } = getLifeEventTypeData(event);
    if (enableFunc) {
      return enableFunc(state.lifeEvents);
    }
    // if there's no enableFunc, the event is enabled by default
    return true;
  });
}
