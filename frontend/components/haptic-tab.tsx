import { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { PlatformPressable } from "@react-navigation/elements";
import * as Haptics from "expo-haptics";

export function HapticTab(props: BottomTabBarButtonProps) {
  const { pointerEvents, ...rest } = props;
  const style = Array.isArray(props.style)
    ? [...props.style]
    : props.style
      ? [props.style]
      : [];

  if (pointerEvents) {
    style.push({ pointerEvents });
  }

  return (
    <PlatformPressable
      {...rest}
      style={style}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === "ios") {
          // Add a soft haptic feedback when pressing down on the tabs.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}
