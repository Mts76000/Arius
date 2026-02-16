import { Stack } from "expo-router";

export default function EntreprisesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Entreprises",
          headerShown: false,
          headerBackVisible: false,
          headerLeft: () => null,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: "Détail Entreprise",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          title: "Nouvelle Entreprise",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[id]/edit"
        options={{
          title: "Modifier Entreprise",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
