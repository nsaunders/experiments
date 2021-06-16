import React, { FC } from "react";
import * as t from "io-ts";
import { getPropTypes } from "prop-types-ts";

const ButtonBlockProps =
  t.union([
    t.type({
      block: t.literal(true),
      alignment: t.union([
        t.literal("left"),
        t.literal("center"),
        t.literal("right")
      ])
    }),
    t.partial({
      block: t.literal(false),
      alignment: t.undefined
    })
  ]);

export type ButtonBlockProps = t.TypeOf<typeof ButtonBlockProps>;

const ButtonProps = t.intersection([
  t.type({ label: t.string }),
  ButtonBlockProps
]);

export type ButtonProps = t.TypeOf<typeof ButtonProps>;

export const Button: FC<ButtonProps> = props => (
  <button
    style={
      props.block
      ? { display: "block", width: "100%", textAlign: props.alignment }
      : {}
    }>
    {props.label}
  </button>
);

Button.propTypes = getPropTypes(ButtonProps) as any;
