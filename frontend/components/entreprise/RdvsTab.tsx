import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { Rdv, RdvStatus } from "@/services/rdvs";
import { RdvCard } from "@/components/cards/RdvCard";
import { styles } from "@/styles/entrepriseDetailStyles";
import { AppButton } from "@/components/ui/AppButton";

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
    >
      <View
      >
        <Text>
          Rendez-vous
        </Text>
        <AppButton title="+ Nouveau RDV" onPress={onAddRdv} />
      </View>

      {rdvsLoading ? (
        <ActivityIndicator
          size="small"
          color="#0ea5e9"
        />
      ) : rdvs && rdvs.length > 0 ? (
        <View>
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
        >
          <Text>📅</Text>
          <Text
          >
            Aucun rendez-vous
          </Text>
          <Text
          >
            Planifie un rendez-vous avec ce client
          </Text>
          <AppButton title="+ Ajouter un RDV" onPress={onAddRdv} />
        </View>
      )}
    </View>
  );
};
