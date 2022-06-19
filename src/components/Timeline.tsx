import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import { getLifeEventTypeData, LifeEvent } from "../businessLogic/lifeEvents";
import { GlobalState } from "../App";
import { Dispatch } from "react";
import Form, { FormPropFields } from "./Form";
import Block from "./Block";

interface TimelineProps {
  lifeEvents: LifeEvent[];
  state: GlobalState;
  dispatch: Dispatch<{ type: string; value: any; key: string }>;
}

export default function Timeline(props: TimelineProps) {
  const renderTimelineElement = (
    event: LifeEvent,
    key: number,
    fields: FormPropFields
  ) => {
    fields = [
      {
        fieldKey: "year",
        label: "Ano",
        type: "number",
        min: 1900,
        max: 2200,
      },
      ...fields,
    ];
    const { icon, label: title } = getLifeEventTypeData(event.type);
    return (
      <VerticalTimelineElement
        key={key}
        date={String(event.year)}
        iconStyle={{ background: "#FFF", color: "#111" }}
        icon={icon}
        contentStyle={{
          background: "#FFF0",
          color: "#111",
          padding: 0,
          boxShadow: "none",
        }}
        contentArrowStyle={{ background: "#FFF0", color: "#1110" }}
      >
        <Block>
          <h2 className="vertical-timeline-element-title">{title}</h2>
          {/* <h4 className="vertical-timeline-element-subtitle">Bachelor Degree</h4> */}
          {/* <p>Creative Direction, Visual Design</p> */}
          <Form
            dispatch={props.dispatch}
            state={props.state}
            fieldKeyPrefix={"lifeEvents[" + key + "]"}
            fields={fields}
          />
        </Block>
      </VerticalTimelineElement>
    );
  };

  const lifeEventComponents = props.lifeEvents
    ?.sort((a, b) => a.year - b.year)
    .map((lifeEvent, index) => {
      switch (lifeEvent.type) {
        case "birth":
          return renderTimelineElement(lifeEvent, index, [
            {
              fieldKey: "name",
              label: "Nome",
              type: "text",
            },
          ]);
        case "marriage":
          return renderTimelineElement(lifeEvent, index, [
            {
              fieldKey: "partnerName",
              label: "Nome do(a) parceiro(a)",
              type: "text",
            },
            {
              fieldKey: "weddingCost",
              label: "Custo da festa de casamento",
              type: "money",
            },
            {
              fieldKey: "partnerInitialWealth",
              label: "Riqueza inicial do(a) parceiro(a)",
              type: "money",
            },
            {
              fieldKey: "additionalLivingCost",
              label: "Custo de vida adicional",
              type: "money",
            },
            {
              fieldKey: "additionalLivingCostYearlyAdjustment",
              label: "Ajuste anual custo de vida",
              type: "interest",
            },
          ]);
        case "moveIntoOwnApartment":
          return renderTimelineElement(lifeEvent, index, [
            {
              fieldKey: "isMortgaged",
              label: "isMortgaged",
              type: "checkbox",
            },
            {
              fieldKey: "fullPrice",
              label: "Preço à vista",
              type: "money",
            },
          ]);
        case "moveIntoRentedApartment":
          return renderTimelineElement(lifeEvent, index, [
            {
              fieldKey: "rent",
              label: "Aluguel + Condomínio (R$/Mês)",
              type: "money",
            },
            {
              fieldKey: "rentYearlyAdjustment",
              label: "Reajuste anual do aluguel",
              type: "interest",
            },
          ]);
        case "professionalCareerStart":
          return renderTimelineElement(lifeEvent, index, [
            {
              fieldKey: "personName",
              label: "Pessoa",
              type: "person",
              year: lifeEvent.year,
            },
            {
              fieldKey: "startingMonthlySalary",
              label: "Salário inicial (R$/Mês)",
              type: "money",
              defaultValue: 3000,
            },
            {
              fieldKey: "topOfLadderSalary",
              label: "Salário topo de carreira (R$/Mês)",
              type: "money",
              defaultValue: 3000,
            },
            {
              fieldKey: "yearsUntilTopOfLadder",
              label: "Anos até topo de carreira",
              type: "money",
              defaultValue: 20,
            },
            {
              fieldKey: "salaryAdjustmentAfterTopOfLadder",
              label: "Ajuste salaria após topo de carreira",
              type: "interest",
              defaultValue: "IPCA",
            },
          ]);
        case "retirement":
          return renderTimelineElement(lifeEvent, index, [
            {
              fieldKey: "personName",
              label: "Pessoa",
              type: "person",
              year: lifeEvent.year,
            },
          ]);
        case "startCoveringOwnExpenses":
          return renderTimelineElement(lifeEvent, index, [
            {
              fieldKey: "monthlyLivingCosts",
              label: "Custo de vida",
              type: "money",
            },
            {
              fieldKey: "livingCostsYearlyAdjustment",
              label: "Ajuste anual do custo de vida",
              type: "interest",
            },
          ]);
        case "simulationStart":
          return renderTimelineElement(lifeEvent, index, [
            {
              fieldKey: "simulationEnd",
              type: "number",
              label: "Fim da simulação",
            },
            {
              fieldKey: "startingWealth",
              type: "number",
              label: "Riqueza inicial ",
            },
            {
              fieldKey: "investmentYearlyReturn",
              type: "number",
              label: "Retorno anual dos investimentos (%/Ano)",
            },
            {
              fieldKey: "IPCA",
              type: "number",
              label: "IPCA (%/Ano)",
            },
            {
              fieldKey: "IGPM",
              type: "number",
              label: "IGPM (%/Ano)",
            },
          ]);
        default:
          throw new Error(
            "Unknown life event type: " + (lifeEvent as any).type!
          );
      }
    });
  return (
    <VerticalTimeline className="col-span-12" layout="2-columns">
      {lifeEventComponents ?? []}
    </VerticalTimeline>
  );
}
