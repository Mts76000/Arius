import React, { useMemo, useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type IoniconName = keyof typeof Ionicons.glyphMap;

export type ActionMenuItem = {
  key: string;
  label: string;
  icon?: IoniconName;
  iconColor?: string;
  textClassName?: string;
  disabled?: boolean;
  onPress: () => void;
};

type ActionMenuRenderArgs = {
  close: () => void;
};

type ActionMenuProps = {
  items?: ActionMenuItem[];
  children?: (args: ActionMenuRenderArgs) => React.ReactNode;
  useModal?: boolean;
  menuWidth?: number;
  menuClassName?: string;
  buttonClassName?: string;
};

function ActionMenuItemRow({
  item,
  onSelect,
}: {
  item: ActionMenuItem;
  onSelect: () => void;
}) {
  return (
    <TouchableOpacity
      className="flex-row items-center gap-2 rounded-xl px-3 py-2"
      onPress={onSelect}
      disabled={item.disabled}
    >
      {item.icon ? (
        <Ionicons
          name={item.icon}
          size={16}
          color={item.iconColor || "#64748B"}
        />
      ) : null}
      <Text
        className={`text-sm font-medium ${item.textClassName || "text-slate-700"}`}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );
}

export function ActionMenu({
  items,
  children,
  useModal = true,
  menuWidth = 190,
  menuClassName,
  buttonClassName,
}: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({ x: 0, y: 0 });

  const menuLeft = useMemo(() => {
    const windowWidth = Dimensions.get("window").width;
    return Math.min(
      windowWidth - menuWidth - 8,
      Math.max(8, menuAnchor.x - menuWidth + 24),
    );
  }, [menuAnchor.x, menuWidth]);

  const close = () => setIsOpen(false);

  const content = (
    <View
      className={`rounded-2xl border border-slate-200 bg-white p-2 shadow-base ${menuClassName || ""}`}
      style={useModal ? { minWidth: menuWidth, elevation: 30 } : undefined}
    >
      {children
        ? children({ close })
        : (items || []).map((item) => (
            <ActionMenuItemRow
              key={item.key}
              item={item}
              onSelect={() => {
                close();
                item.onPress();
              }}
            />
          ))}
    </View>
  );

  return (
    <View className="relative">
      <TouchableOpacity
        onPress={(event) => {
          event.stopPropagation();
          if (useModal) {
            setMenuAnchor({
              x: event.nativeEvent.pageX,
              y: event.nativeEvent.pageY,
            });
          }
          setIsOpen((prev) => !prev);
        }}
        className={
          buttonClassName ||
          "h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white"
        }
      >
        <Ionicons name="ellipsis-vertical" size={16} color="#64748B" />
      </TouchableOpacity>

      {useModal ? (
        <Modal
          visible={isOpen}
          transparent
          animationType="fade"
          onRequestClose={close}
        >
          <Pressable className="flex-1" onPress={close}>
            <Pressable
              className="absolute"
              style={{
                top: menuAnchor.y + 10,
                left: menuLeft,
                minWidth: menuWidth,
              }}
              onPress={(event) => event.stopPropagation()}
            >
              {content}
            </Pressable>
          </Pressable>
        </Modal>
      ) : isOpen ? (
        <View className="absolute right-0 top-11 z-10 min-w-36">{content}</View>
      ) : null}
    </View>
  );
}
