import * as F from "./Flare";
import { Flare } from "./Flare";
import { pipe } from "fp-ts/lib/function";
import React, { FC, ReactNode, useState } from "react";

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

export const App = makeDemo(
  pipe(
    F.of((name: string) => (age: string) => (exclaim: boolean) => `${name} is ${age}${exclaim ? "!" : "."}`),
    F.ap(
      pipe(
        F.select({ defaultValue: "Nick" as const, options: ["Wyman", "Nick", "Liz"] as const }),
        F.chain(who => who === "Wyman" || who === "Nick" ? pipe(F.select({ defaultValue: "Sr", options: ["Sr", "Jr"] }), F.map(suffix => `${who} ${suffix}`)) : F.of(who)),
      ),
    ),
    F.ap(
      pipe(
        F.of((y: number) => (m: number | undefined) => `${y}y${m ? `${m}m` : ""}`),
        F.ap(F.number({ defaultValue: 3 })),
        F.ap(pipe(F.checkbox({ defaultValue: true }), F.chain(x => x ? F.number({ defaultValue: 9 }) : F.of(undefined)))),
      ),
    ),
    F.ap(F.checkbox({ defaultValue: true })),
  ),
  st => (
    <div style={{background:"black",color:"white"}}>{JSON.stringify(st)}</div>
  )
);
