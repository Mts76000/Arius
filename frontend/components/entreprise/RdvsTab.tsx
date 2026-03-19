import React from "react";
import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { Rdv, RdvStatus } from "@/services/rdvs";
import { Contact } from "@/services/contacts";
import { RdvCard } from "@/components/cards/RdvCard";
import { AppButton } from "@/components/ui/AppButton";

interface RdvsTabProps {
  rdvs: Rdv[] | undefined;
  contacts?: Contact[];
  rdvsLoading: boolean;
  onAddRdv: () => void;
  onEditRdv: (rdv: Rdv) => void;
  onDeleteRdv: (rdvId: string) => void;
  onChangeStatus: (rdvId: string, status: RdvStatus) => void;
}

export const RdvsTab: React.FC<RdvsTabProps> = ({
  rdvs,
  contacts,
  rdvsLoading,
  onAddRdv,
  onEditRdv,
  onDeleteRdv,
  onChangeStatus,
}) => {
  const getContactNameById = (contactId?: string) => {
    if (!contactId) return undefined;

    const contact = contacts?.find((c) => c.id === contactId);
    if (!contact) return undefined;

    const fullName = `${contact.prenom || ""} ${contact.nom || ""}`.trim();
    return fullName || contact.nom || undefined;
  };

  return (
    <View className="p-5">
      <View className="flex flex-row justify-between pt-5">
        <Text className="text-lg font-bold">Rendez-vous</Text>
        <TouchableOpacity onPress={onAddRdv}>
          <Text className="text-primary font-semibold text-lg">+ Ajouter</Text>
        </TouchableOpacity>
      </View>
      {rdvsLoading ? (
        <ActivityIndicator size="small" color="#0ea5e9" />
      ) : rdvs && rdvs.length > 0 ? (
        <View className="bg-white rounded-3xl p-5 mt-5 flex-col gap-4 ">
          {rdvs.map((rdv) => (
            <RdvCard
              key={rdv._id}
              rdv={rdv}
              contactName={getContactNameById(rdv.contact_id)}
              onEdit={() => onEditRdv(rdv)}
              onDelete={() => onDeleteRdv(rdv._id)}
              onChangeStatus={(status) => onChangeStatus(rdv._id, status)}
            />
          ))}
        </View>
      ) : (
        <View>
          <Text>📅</Text>
          <Text>Aucun rendez-vous</Text>
          <Text>Planifie un rendez-vous avec ce client</Text>
          <AppButton title="+ Ajouter un RDV" onPress={onAddRdv} />
        </View>
      )}
    </View>
  );
};
