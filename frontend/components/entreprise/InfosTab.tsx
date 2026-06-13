import React from "react";
import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { Contact } from "@/services/contacts";
import type { Entreprise } from "@/services/entreprises";
import { ContactCard } from "@/components/cards/ContactCard";
import { Ionicons } from "@expo/vector-icons";

interface InfosTabProps {
  entreprise: Entreprise;
  contacts: Contact[] | undefined;
  contactsLoading: boolean;
  onAddContact: () => void;
  onEditContact: (contact: Contact) => void;
  onDeleteContact: (contactId: string) => void;
  onCall: (tel: string) => void;
  onEmail: (email: string) => void;
}

export const InfosTab: React.FC<InfosTabProps> = ({
  entreprise,
  contacts,
  contactsLoading,
  onAddContact,
  onEditContact,
  onDeleteContact,
  onCall,
  onEmail,
}) => {
  return (
    <View className="p-5">
      {(entreprise.rue ||
        entreprise.ville ||
        entreprise.code_postal ||
        entreprise.pays) && (
        <View className="bg-white p-5 rounded-3xl shadow-base flex-row items-center mb-3">
          <View className="bg-primary/20 flex justify-center items-center rounded-xl  h-14 w-14 mr-4">
            <Ionicons name="location-outline" size={25} color="#007aff" />
          </View>
          <View>
            <Text className="text-base font-semibold text-slate-900">Adresse</Text>

            <View className="flex-col gap-2 mt-2">
              {entreprise.rue && (
                <Text className="text-sm text-gray">{entreprise.rue}</Text>
              )}
              {(entreprise.code_postal ||
                entreprise.ville ||
                entreprise.pays) && (
                <Text className="text-sm capitalize text-gray">
                  {entreprise.code_postal && `${entreprise.code_postal} `}
                  {entreprise.ville && ` ${entreprise.ville}`}
                  {entreprise.pays && `, ${entreprise.pays}`}
                </Text>
              )}
            </View>
          </View>
        </View>
      )}

      <View>
        <View className="flex flex-row justify-between pt-5">
          <Text className="text-lg font-semibold text-slate-900">Contacts</Text>
          <TouchableOpacity onPress={onAddContact}>
            <Text className="text-base font-semibold text-primary">
              + Ajouter
            </Text>
          </TouchableOpacity>
        </View>

        {contactsLoading ? (
          <ActivityIndicator size="small" color="#2563eb" />
        ) : contacts && contacts.length > 0 ? (
          <View className="bg-white rounded-3xl p-5 mt-5 flex-col gap-4 ">
            {contacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onEdit={onEditContact}
                onDelete={onDeleteContact}
                onCall={onCall}
                onEmail={onEmail}
              />
            ))}
          </View>
        ) : (
        <View className="rounded-3xl border border-slate-100 bg-white px-6 py-8 mt-8 items-center">
          <Text className="text-base font-semibold text-slate-900">
            Aucun contact
          </Text>
          <Text className="mt-1 text-center text-sm text-slate-500">
            Ajoutez un contact pour appeler ou envoyer un email rapidement.
          </Text>
        </View>
      )}
      </View>
    </View>
  );
};
