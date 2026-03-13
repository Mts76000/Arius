import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { Contact } from "@/services/contacts";
import { ContactCard } from "@/components/cards/ContactCard";
import { styles } from "@/styles/entrepriseDetailStyles";
import { AppButton } from "@/components/ui/AppButton";

interface InfosTabProps {
  entreprise: any;
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
    <View>
      {/* Description Section */}
      {entreprise.description && (
        <View>
          <Text>Description</Text>
          <Text>{entreprise.description}</Text>
        </View>
      )}

      {/* Address Section */}
      {(entreprise.rue ||
        entreprise.ville ||
        entreprise.code_postal ||
        entreprise.pays) && (
        <View>
          <Text>Adresse</Text>
          <View>
            {entreprise.rue && (
              <Text>{entreprise.rue}</Text>
            )}
            {(entreprise.code_postal || entreprise.ville) && (
              <Text>
                {entreprise.code_postal && `${entreprise.code_postal} `}
                {entreprise.ville}
              </Text>
            )}
            {entreprise.pays && (
              <Text>{entreprise.pays}</Text>
            )}
          </View>
        </View>
      )}

      {/* Contacts Section */}
      <View>
        <View>
          <Text>Contacts</Text>
          <AppButton title="+ Ajouter" onPress={onAddContact} />
        </View>

        {contactsLoading ? (
          <ActivityIndicator size="small" color="#2563eb" />
        ) : contacts && contacts.length > 0 ? (
          <View>
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
          <Text>Aucun contact</Text>
        )}
      </View>
    </View>
  );
};
