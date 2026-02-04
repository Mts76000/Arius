import { Stack } from "expo-router";

export default function EntreprisesLayout() {
  return (
    <Stack
      screenOptions={{
        animationEnabled: true,
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
          animationEnabled: true,
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          title: "Nouvelle Entreprise",
          headerShown: false,
          animationEnabled: true,
        }}
      />
      <Stack.Screen
        name="edit/[id]"
        options={{
          title: "Modifier Entreprise",
          headerShown: false,
          animationEnabled: true,
        }}
      />
    </Stack>
  );
}
