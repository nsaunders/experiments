import { Monad1 } from "fp-ts/Monad";

export const URI = "Flare";

export type URI = typeof URI;

declare module "fp-ts/lib/HKT" {
  interface URItoKind<A> {
    readonly Flare: Flare<A>
  }
}

export interface Flare<A> {
  initialState: A;
  query: () => A;
  render: (onChange: () => void) => [Node[], () => void];
}

export const flare: Monad1<URI> = {
  URI,
  ap: function(fab, fa) {
    return {
      initialState: fab.initialState(fa.initialState),
      query: () => fab.query()(fa.query()),
      render: onChange => {
        const [nodesA, teardownA] = fab.render(onChange);
        const [nodesB, teardownB] = fa.render(onChange);
        return [
          nodesA.concat(nodesB),
          () => { teardownA(); teardownB(); }
        ];
      },
    };
  },
  chain: function(fa, f) {
    return {
      initialState: f(fa.initialState).initialState,
      query: () => f(fa.query()).query(),
      render: onChange => {
        const [nodesA, teardownA] = fa.render(onChange);
        const [nodesB, teardownB] = f(fa.query()).render(onChange);
        return [
          nodesA.concat(nodesB),
          () => { teardownA(); teardownB(); }
        ];
      },
    };
  },
  map: function(ma, f) {
    return {
      initialState: f(ma.initialState),
      query: () => f(ma.query()),
      render: ma.render,
    };
  },
  of: function(a) {
    return {
      initialState: a,
      query: () => a,
      render: () => [[], () => {}],
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
  let input: HTMLInputElement | null = null;
  return {
    initialState: defaultValue,
    query: () => input ? input.checked : defaultValue,
    render: onChange => {
      input = document.createElement("input");
      input.type = "checkbox";
      input.checked = defaultValue;
      input.addEventListener("change", onChange);
      return [
        [input],
        () => { input && input.removeEventListener("change", onChange); },
      ];
    },
  };
}

export function number({ defaultValue }: { defaultValue: number; }): Flare<number> {
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

export function string({ defaultValue }: { defaultValue: string; }): Flare<string> {
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
