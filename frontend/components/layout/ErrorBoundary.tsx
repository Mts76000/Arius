import React from "react";
import { ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppButton } from "@/components/ui/AppButton";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Erreur non capturee dans l'app:", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <View className="flex-1 bg-gray-50">
          <ScrollView
            className="pt-8"
            contentContainerStyle={{
              alignSelf: "center",
              maxWidth: 920,
              paddingBottom: 56,
              paddingHorizontal: 20,
              width: "100%",
            }}
          >
            <View className="gap-5">
              <View className="rounded-3xl bg-white p-6 shadow-base">
                <View className="flex-row items-start gap-4">
                  <View className="h-14 w-14 items-center justify-center rounded-2xl bg-red-100">
                    <Ionicons
                      name="warning-outline"
                      size={26}
                      color="#dc2626"
                    />
                  </View>

                  <View className="min-w-0 flex-1 gap-1">
                    <Text className="text-sm font-semibold uppercase text-red-600">
                      Erreur inattendue
                    </Text>
                    <Text className="text-2xl font-bold text-slate-950">
                      Une erreur est survenue
                    </Text>
                    <Text className="text-base leading-6 text-slate-500">
                      {"Quelque chose s'est mal passe. Tu peux reessayer ou "}
                      {"revenir a l'accueil."}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="rounded-3xl bg-white p-5 shadow-base">
                <View className="gap-3">
                  <AppButton title="Reessayer" onPress={this.handleReset} />
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}
