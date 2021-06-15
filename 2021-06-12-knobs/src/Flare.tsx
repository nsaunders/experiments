import React, { FC } from "react";
import { Monad1 } from "fp-ts/Monad";

export const URI = "Flare";

export type URI = typeof URI;

declare module "fp-ts/lib/HKT" {
  interface URItoKind<A> {
    readonly Flare: Flare<A>
  }
}

export interface Flare<A> {
  query: () => A;
  render: FC<{ onChange: () => void; children?: undefined; }>;
}

export const flare: Monad1<URI> = {
  URI,
  ap: function(fab, fa) {
    const ComponentFAB = fab.render;
    const ComponentFA = fa.render;
    return {
      query: () => fab.query()(fa.query()),
      render: ({ onChange }) => (
        <>
          <ComponentFAB onChange={onChange} />
          <ComponentFA onChange={onChange} />
        </>
      ),
    };
  },
  chain: function(fa, f) {
    const ComponentFA = fa.render;
    let flareB = f(fa.query());
    return {
      query: () => flareB.query(),
      render: ({ onChange }) => (
        <>
          <ComponentFA onChange={
            () => {
              flareB = f(fa.query());
              onChange();
            }} />
          {flareB.render({ onChange })}
        </>
      ),
    };
  },
  map: function(ma, f) {
    return {
      query: () => f(ma.query()),
      render: ma.render,
    };
  },
  of: function(a) {
    return {
      query: () => a,
      render: () => null,
    };
  },
};

function curry2<A, B, Y>(f: (a: A, b: B) => Y): (a: A) => (b: B) => Y {
  return a => b => f(a, b);
}

function flip2<A, B, Y>(f: (a: A, b: B) => Y): (b: B, a: A) => Y {
  return (a, b) => f(b, a);
}

export const ap = curry2(flip2(flare.ap));
export const chain = curry2(flip2(flare.chain));
export const map = curry2(flip2(flare.map));
export const of = flare.of;

export function checkbox({ defaultValue }: { defaultValue: boolean; }): Flare<boolean> {
  let state = defaultValue;
  return {
    query: () => state,
    render: ({ onChange }) => (
      <input
        type="checkbox"
        checked={state}
        onChange={({ target: { checked } }) => {
          state = checked;
          onChange();
        }} />
    ),
  };
}

export function number({ defaultValue }: { defaultValue: number; }): Flare<number> {
  let state = defaultValue;
  return {
    query: () => state,
    render: ({ onChange }) => (
      <input
        type="number"
        value={state}
        onChange={({ target: { value } }) => {
          const val = parseFloat(value);
          if (!isNaN(val)) {
            state = val;
            onChange();
          }
        }} />
    ),
  };
}

export function select<O extends string, S extends O>({ defaultValue, options }: { defaultValue: S, options: Readonly<O[]> }): Flare<O> {
  let state = defaultValue;
  return {
    query: () => state,
    render: ({ onChange }) => (
      <select
        value={state}
        onChange={({ target: { value } }) => {
          state = value as S;
          onChange();
        }}>
          {options.map(value => (<option key={value}>{value}</option>))}
      </select>
    ),
  };
}

export function string({ defaultValue }: { defaultValue: string; }): Flare<string> {
  let state = defaultValue;
  return {
    query: () => state,
    render: ({ onChange }) => (
      <input
        type="text"
        value={state}
        onChange={({ target: { value } }) => {
          state = value;
          onChange();
        }} />
    ),
  };
}
