import { Stack } from "expo-router";

export default function EntreprisesLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Entreprises",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: "Détail Entreprise",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          title: "Nouvelle Entreprise",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="edit/[id]"
        options={{
          title: "Modifier Entreprise",
          headerShown: true,
        }}
      />
    </Stack>
  );
}
