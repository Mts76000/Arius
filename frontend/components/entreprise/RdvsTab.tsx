import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Rdv, RdvStatus } from "@/services/rdvs";
import { RdvCard } from "@/components/RdvCard";
import { styles } from "@/styles/entrepriseDetailStyles";

interface RdvsTabProps {
  rdvs: Rdv[] | undefined;
  rdvsLoading: boolean;
  onAddRdv: () => void;
  onEditRdv: (rdv: Rdv) => void;
  onDeleteRdv: (rdvId: string) => void;
  onChangeStatus: (rdvId: string, status: RdvStatus) => void;
}

export const RdvsTab: React.FC<RdvsTabProps> = ({
  rdvs,
  rdvsLoading,
  onAddRdv,
  onEditRdv,
  onDeleteRdv,
  onChangeStatus,
}) => {
  return (
    <View
      style={{
        backgroundColor: "#ffffff",
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 24,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "800", color: "#0f172a" }}>
          Rendez-vous
        </Text>
        <TouchableOpacity
          onPress={onAddRdv}
          style={{
            backgroundColor: "#0ea5e9",
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: "#ffffff", fontWeight: "700", fontSize: 14 }}>
            + Nouveau RDV
          </Text>
        </TouchableOpacity>
      </View>

      {rdvsLoading ? (
        <ActivityIndicator
          size="small"
          color="#0ea5e9"
          style={{ marginTop: 32 }}
        />
      ) : rdvs && rdvs.length > 0 ? (
        <View style={{ gap: 12 }}>
          {rdvs.map((rdv) => (
            <RdvCard
              key={rdv._id}
              rdv={rdv}
              onEdit={() => onEditRdv(rdv)}
              onDelete={() => onDeleteRdv(rdv._id)}
              onChangeStatus={(status) => onChangeStatus(rdv._id, status)}
            />
          ))}
        </View>
      ) : (
        <View
          style={{
            backgroundColor: "#f8fafc",
            borderColor: "#e2e8f0",
            borderWidth: 1,
            borderRadius: 12,
            padding: 24,
            alignItems: "center",
            marginTop: 32,
          }}
        >
          <Text style={{ fontSize: 48, marginBottom: 12 }}>📅</Text>
          <Text
            style={{
              color: "#0f172a",
              fontWeight: "700",
              fontSize: 16,
              marginBottom: 6,
            }}
          >
            Aucun rendez-vous
          </Text>
          <Text
            style={{
              color: "#64748b",
              fontSize: 14,
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            Planifie un rendez-vous avec ce client
          </Text>
          <TouchableOpacity
            onPress={onAddRdv}
            style={{
              backgroundColor: "#0ea5e9",
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: "#ffffff", fontWeight: "700" }}>
              + Ajouter un RDV
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
