import * as F from "./Flare";
import { Flare } from "./Flare";
import { pipe } from "fp-ts/lib/function";
import React, { FC, ReactNode, useEffect, useState } from "react";
import { Button } from "./Button";

function makeDemo<A>(knobs: Flare<A>, render: (_: A) => ReactNode): FC<{}> {
  return function() {
    const [state, setState] = useState<A>(knobs.initialState);
    const onChange = () => { setState(knobs.query()); };

    const [controlPanel, setControlPanel] = useState<Node | null>(null);

    useEffect(() => {
      if (controlPanel) {
        const [nodes, teardown] = knobs.render(onChange);
        nodes.forEach(node => controlPanel.appendChild(node));
        return () => {
          while (controlPanel.firstChild) controlPanel.removeChild(controlPanel.firstChild);
          teardown();
        };
      }
    }, [controlPanel]);

    return (
      <>
        <div style={{background:"lightgray"}} ref={setControlPanel} />
        <div style={{border:"1px solid red",padding:8}}>
          {render(state)}
        </div>
      </>
    );
  };
}

export const App = makeDemo(
  pipe(
    F.of((name: string) => (age: string) => (exclaim: boolean) => `${name} is ${age}${exclaim ? "!" : "."}`),
    F.ap(F.string({ defaultValue: "Nicolin" })),
    F.ap(
      pipe(
        F.of((y: number) => (m: number) => `${y}y${m}m`),
        F.ap(F.number({ defaultValue: 3 })),
        F.ap(pipe(F.checkbox({ defaultValue: true }), F.chain(x => x ? F.number({ defaultValue: 9 }) : F.of(0)))),
      ),
    ),
    F.ap(F.checkbox({ defaultValue: true })),
  ),
  st => (
    <div style={{background:"black",color:"white"}}>{JSON.stringify(st)}</div>
  )
);
