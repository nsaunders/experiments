import { pipe } from "fp-ts/lib/function";
import React, { FC, ReactNode, useEffect, useState } from "react";
import { Button } from "./Button";

interface UI<A> {
  initialState: A;
  query: () => A;
  render: (onChange: () => void) => [Node[], () => void];
}

function number({ defaultValue }: { defaultValue: number; }): UI<number> {
  let input: HTMLInputElement | null = null;
  return {
    initialState: defaultValue,
    query: () => {
      const value = input ? parseFloat(input.value) : NaN;
      return isNaN(value) ? defaultValue : value;
    },
    render: onChange => {
      input = document.createElement("input");
      input.type = "number";
      input.value = defaultValue.toString();
      input.addEventListener("input", onChange);
      return [
        [input],
        () => { input && input.removeEventListener("input", onChange); },
      ];
    },
  };
}

function string({ defaultValue }: { defaultValue: string; }): UI<string> {
  let input: HTMLInputElement | null = null;
  return {
    initialState: defaultValue,
    query: () => input ? input.value : defaultValue,
    render: onChange => {
      input = document.createElement("input");
      input.value = defaultValue.toString();
      input.addEventListener("input", onChange);
      return [
        [input],
        () => { input && input.removeEventListener("input", onChange); },
      ];
    },
  };
}

function apUI<A, B>(fa: UI<A>) {
  return (fatob: UI<(a: A) => B>): UI<B> => ({
    initialState: fatob.initialState(fa.initialState),
    query: () => fatob.query()(fa.query()),
    render: onChange => {
      const [nodesA, teardownA] = fatob.render(onChange);
      const [nodesB, teardownB] = fa.render(onChange);
      return [
        nodesA.concat(nodesB),
        () => { teardownA(); teardownB(); }
      ];
    },
  });
}

function pureUI<A>(a: A): UI<A> {
  return {
    initialState: a,
    query: () => a,
    render: () => [[], () => {}],
  };
}

function mapUI<A, B>(fn: (a: A) => B) {
  return (a: UI<A>): UI<B> => ({
    initialState: fn(a.initialState),
    query: () => fn(a.query()),
    render: a.render,
  });
}

function makeDemo<A>(knobs: UI<A>, render: (_: A) => ReactNode): FC<{}> {
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

const aUI = {
  map: mapUI,
  of: pureUI,
  ap: apUI,
};

export const App = makeDemo(
  pipe(
    aUI.of((name: string) => (age: number) => `${name} is ${age}`),
    aUI.ap(string({ defaultValue: "Nicolin" })),
    aUI.ap(
      pipe(
        aUI.of((a: number) => (b: number) => a + b),
        aUI.ap(number({ defaultValue: 5 })),
        aUI.ap(number({ defaultValue: 8 })),
      ),
    ),
  ),
  st => (
    <div style={{background:"black",color:"white"}}>{JSON.stringify(st)}</div>
  )
);
