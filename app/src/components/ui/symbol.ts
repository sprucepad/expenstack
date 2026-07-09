import { SymbolView } from "expo-symbols";
import { styled } from "nativewind";

export const StyledSymbol = styled(SymbolView, {
  className: {
    target: "style",
    nativeStyleMapping: {
      color: "tintColor",
    },
  },
});
