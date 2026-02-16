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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.text}>{entreprise.description}</Text>
        </View>
      )}

      {/* Address Section */}
      {(entreprise.rue ||
        entreprise.ville ||
        entreprise.code_postal ||
        entreprise.pays) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adresse</Text>
          <View style={styles.addressCard}>
            {entreprise.rue && (
              <Text style={styles.addressText}>{entreprise.rue}</Text>
            )}
            {(entreprise.code_postal || entreprise.ville) && (
              <Text style={styles.addressText}>
                {entreprise.code_postal && `${entreprise.code_postal} `}
                {entreprise.ville}
              </Text>
            )}
            {entreprise.pays && (
              <Text style={styles.addressText}>{entreprise.pays}</Text>
            )}
          </View>
        </View>
      )}

      {/* Contacts Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Contacts</Text>
          <AppButton title="+ Ajouter" onPress={onAddContact} size="sm" />
        </View>

        {contactsLoading ? (
          <ActivityIndicator size="small" color="#2563eb" />
        ) : contacts && contacts.length > 0 ? (
          <View style={styles.contactsList}>
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
          <Text style={styles.noContacts}>Aucun contact</Text>
        )}
      </View>
    </View>
  );
};
