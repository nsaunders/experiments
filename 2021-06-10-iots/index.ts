import * as t from "io-ts";

const buttonProps = t.intersection([
  t.strict({ label: t.string }),
  t.union([
    t.strict({
      block: t.literal(true),
      alignment: t.union([t.literal("left"), t.literal("center"), t.literal("right")]),
    }),
    t.strict({
      block: t.literal(false)
    })
  ])
]);

type ButtonProps = t.TypeOf<typeof buttonProps>;

const out = buttonProps.decode({ label: "nick", block: false });

console.log(out);
