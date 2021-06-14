import * as F from "./Flare";
import { Flare } from "./Flare";
import { pipe } from "fp-ts/lib/function";
import React, { FC, ReactNode, useEffect, useState } from "react";
import { Button } from "./Button";

interface UI<A> {
  initialState: A;
  query: () => A;
  render: (onChange: () => void) => [Node[], () => void];
}

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
    F.of((name: string) => (age: number) => (exclaim: boolean) => `${name} is ${age}${exclaim ? "!" : "."}`),
    F.ap(F.string({ defaultValue: "Nicolin" })),
    F.ap(
      pipe(
        F.of((a: number) => (b: number) => a + b),
        F.ap(F.number({ defaultValue: 5 })),
        F.ap(F.number({ defaultValue: 8 })),
      ),
    ),
  ),
  st => (
    <div style={{background:"black",color:"white"}}>{JSON.stringify(st)}</div>
  )
);
