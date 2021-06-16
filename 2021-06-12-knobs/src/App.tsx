import * as F from "./Flare";
import { Flare } from "./Flare";
import { pipe } from "fp-ts/lib/function";
import React, { FC, ReactNode, useState } from "react";
import { Button, ButtonProps } from "./Button";

function makeDemo<A>(knobs: Flare<A>, render: (_: A) => ReactNode): FC<{}> {
  return function() {
    const [state, setState] = useState<A>(knobs.query());
    const onChange = () => { setState(knobs.query()); };

    return (
      <>
        <div style={{background:"lightgray"}}>
          {knobs.render({ onChange })}
        </div>
        <div style={{border:"1px solid red",padding:8}}>
          {render(state)}
        </div>
      </>
    );
  };
}

const alignment = F.select({
  defaultValue: "center" as const,
  options: ["left", "center", "right"] as const,
});

const blockProps = pipe(
  F.checkbox({ defaultValue: true }),
  F.chain(block => (
    block
    ? pipe(alignment, F.map(alignment => ({ block, alignment })))
    : F.of({ block: false })
  )),
);

export const App = makeDemo(
  pipe(
    F.of((label: string) => (blockProps: any) => ({ label, ...blockProps })),
    F.ap(F.string({ defaultValue: "Button" })),
    F.ap(blockProps),
  ),
  Button,
);
