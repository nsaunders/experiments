{ name = "my-project"
, dependencies =
  [ "console"
  , "effect"
  , "halogen"
  , "halogen-hooks"
  , "halogen-hooks-extra"
  , "psci-support"
  ]
, packages = ./packages.dhall
, sources = [ "src/**/*.purs", "test/**/*.purs" ]
}
