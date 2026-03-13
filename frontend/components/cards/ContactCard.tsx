import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Contact } from "@/services/contacts";
import { styles } from "@/styles/entrepriseDetailStyles";

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
  return (
    <View>
      <View>
        <View>
          <Text>
            {contact.prenom} {contact.nom}
          </Text>
          {contact.contact_principal && (
            <View>
              <Text>Principal</Text>
            </View>
          )}
        </View>
        <View>
          <TouchableOpacity onPress={() => onEdit(contact)}>
            <Text>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(contact.id)}>
            <Text>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {contact.poste && (
        <Text>{contact.poste}</Text>
      )}

      {contact.email && (
        <TouchableOpacity onPress={() => onEmail(contact.email!)}>
          <Text>
            📧 {contact.email}
          </Text>
        </TouchableOpacity>
      )}

      {contact.tel_mobile && (
        <TouchableOpacity onPress={() => onCall(contact.tel_mobile!)}>
          <Text>
            📱 {contact.tel_mobile}
          </Text>
        </TouchableOpacity>
      )}

      {contact.tel_direct && (
        <TouchableOpacity onPress={() => onCall(contact.tel_direct!)}>
          <Text>
            ☎️ {contact.tel_direct}
          </Text>
        </TouchableOpacity>
      )}

      {contact.commentaire && (
        <Text>{contact.commentaire}</Text>
      )}
    </View>
  );
}
