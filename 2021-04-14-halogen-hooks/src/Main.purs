module Main where

import Prelude
import Data.Tuple.Nested ((/\))
import Effect (Effect)
import Halogen as H
import Halogen.Aff (awaitBody, runHalogenAff)
import Halogen.HTML as HH
import Halogen.HTML.Events as HE
import Halogen.HTML.Properties as HP
import Halogen.Hooks as Hooks
import Halogen.Hooks.Extra.Hooks.UseStateFn (useStateFn)
import Halogen.VDom.Driver (runUI)
import Type.Proxy (Proxy(..))

main :: Effect Unit
main =
  runHalogenAff $ awaitBody >>= runUI app unit

data Action = Increment | Decrement

_button = Proxy :: Proxy "button"

app :: forall q i o m. H.Component q i o m
app =
  H.mkComponent
    { initialState: const 0
    , eval: H.mkEval H.defaultEval { handleAction = handleAction }
    , render
    }

  where

    handleAction =
      case _ of
        Increment ->
          H.modify_ \x -> x + 1
        Decrement ->
          H.modify_ \x -> x - 1

    render s =
      stack Horizontal
        [ HH.slot _button 0 button "-" (const Decrement)
        , HH.div_ [HH.text $ show s]
        , HH.slot _button 1 button "+" (const Increment)
        ]

data Orientation = Horizontal | Vertical

stack :: forall p i. Orientation -> Array (HH.HTML p i) -> HH.HTML p i
stack o =
  let
    flexDirection =
      case o of
        Horizontal -> "row"
        Vertical -> "column"
  in
    HH.div [HP.style $ "display:flex; justify-content:stretch; flex-direction:" <> flexDirection]

button :: forall q m. H.Component q String Unit m
button = Hooks.component \{ outputToken } t -> Hooks.do
  hover /\ setHover <- useStateFn Hooks.modify_ false
  Hooks.pure $
    HH.button
      [ HE.onClick \_ -> Hooks.raise outputToken unit
      , HE.onMouseOver \_ -> setHover $ const true
      , HE.onMouseOut \_ -> setHover $ const false
      , HP.style $ if hover then "background:#0cf" else ""
      ]
      [HH.text t]
