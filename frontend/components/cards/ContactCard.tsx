import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Contact } from "@/services/contacts";
import { ActionMenu } from "@/components/ui/ActionMenu";

type Props = {
  contact: Contact;
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
  onCall: (tel: string) => void;
  onEmail: (email: string) => void;
};

export function ContactCard({
  contact,
  onEdit,
  onDelete,
  onCall,
  onEmail,
}: Props) {
  const firstName = contact.prenom?.trim() || "";
  const lastName = contact.nom?.trim() || "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ");

  const initials = [firstName, lastName]
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <View className="rounded-2xl border border-slate-100 bg-slate-50 p-4 ">
      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-1 flex-row items-center gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-full border border-primary/25 bg-primary/15">
            <Text className="text-base font-semibold uppercase text-primary">
              {initials || "?"}
            </Text>
          </View>

          <View className="flex-1 gap-1">
            <View className="flex-row items-center gap-2">
              <Text className="text-base font-semibold" numberOfLines={1}>
                {fullName || lastName}
              </Text>
              {contact.contact_principal ? (
                <View className="rounded-full bg-primary/15 px-2 py-1">
                  <Text className="text-xs font-bold text-primary">
                    Principal
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        <ActionMenu
          items={[
            {
              key: "edit",
              label: "Modifier",
              icon: "pencil-outline",
              iconColor: "#3B82F6",
              onPress: () => onEdit(contact),
            },
            {
              key: "delete",
              label: "Supprimer",
              icon: "trash-outline",
              iconColor: "#EF4444",
              textClassName: "text-red-500",
              onPress: () => onDelete(contact.id),
            },
          ]}
        />
      </View>

      <View className="mt-3 w-full items-start gap-4">
        {contact.poste ? (
          <Text
            className="text-sm font-medium text-slate-500"
            numberOfLines={1}
          >
            {contact.poste}
          </Text>
        ) : (
          <Text className="text-sm text-slate-400">Poste non renseigné</Text>
        )}

        {contact.tel_mobile ? (
          <TouchableOpacity
            onPress={() => onCall(contact.tel_mobile!)}
            className="max-w-full self-start flex-row items-start gap-2 "
          >
            <Ionicons name="phone-portrait-outline" size={20} color="#34C759" />

            <Text className="text-sm text-left text-slate-700">
              {contact.tel_mobile}
            </Text>
          </TouchableOpacity>
        ) : null}

        {contact.tel_direct ? (
          <TouchableOpacity
            onPress={() => onCall(contact.tel_direct!)}
            className="max-w-full self-start flex-row items-center gap-2"
          >
            <Ionicons name="call-outline" size={20} color="#A855F7" />
            <Text className="text-sm text-left text-slate-700">
              {contact.tel_direct}
            </Text>
          </TouchableOpacity>
        ) : null}

        {contact.email ? (
          <TouchableOpacity
            onPress={() => onEmail(contact.email!)}
            className="max-w-full self-start flex-row items-center gap-2"
          >
            <Ionicons name="mail-outline" size={20} color="#0ea5e9" />
            <Text
              className="max-w-[88%] text-sm text-left text-slate-700"
              numberOfLines={1}
            >
              {contact.email}
            </Text>
          </TouchableOpacity>
        ) : null}

        {!contact.tel_mobile && !contact.tel_direct && !contact.email ? (
          <Text className="text-sm text-slate-400">
            Aucun moyen de contact renseigné
          </Text>
        ) : null}
      </View>

      {contact.commentaire ? (
        <View className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-2">
          <Text className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Commentaire
          </Text>
          <Text className="mt-1 text-sm text-slate-700">
            {contact.commentaire}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
