import * as F from "./Flare";
import { Flare } from "./Flare";
import { pipe } from "fp-ts/lib/function";
import React, { FC, ReactNode, useState } from "react";
import { Button, ButtonBlockProps } from "./Button";

function makeDemo(knobs: Flare<ReactNode>): FC<{}> {
  return function() {
    const [state, setState] = useState<ReactNode>(knobs.query());
    const onChange = () => { setState(knobs.query()); };

    return (
      <>
        <div style={{background:"lightgray"}}>
          {knobs.render({ onChange })}
        </div>
        <div style={{border:"1px solid red",padding:8}}>
          {state}
        </div>
      </>
    );
  };
}

const alignment = F.select({
  defaultValue: "center" as const,
  options: ["left", "center", "right"] as const,
});

const blockProps: Flare<ButtonBlockProps> = pipe(
  F.checkbox({ defaultValue: true }),
  F.chain(F.ifElse(
    pipe(alignment, F.map(alignment => ({ block: true, alignment }))),
    F.of({ block: false, alignment: undefined }),
  )),
);

export const App = makeDemo(
  pipe(
    F.of((label: string) => (blockProps: ButtonBlockProps) => (<Button {...{ label, ...blockProps }} />)),
    F.ap(F.string({ defaultValue: "Button" })),
    F.ap(blockProps),
  ),
);
