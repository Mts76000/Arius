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
    <View style={styles.contactCard}>
      <View style={styles.contactHeader}>
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>
            {contact.prenom} {contact.nom}
          </Text>
          {contact.contact_principal && (
            <View style={styles.principalBadge}>
              <Text style={styles.principalBadgeText}>Principal</Text>
            </View>
          )}
        </View>
        <View style={styles.contactActions}>
          <TouchableOpacity onPress={() => onEdit(contact)}>
            <Text style={styles.contactActionText}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(contact.id)}>
            <Text style={styles.contactActionText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {contact.poste && (
        <Text style={styles.contactDetail}>{contact.poste}</Text>
      )}

      {contact.email && (
        <TouchableOpacity onPress={() => onEmail(contact.email!)}>
          <Text style={[styles.contactDetail, styles.contactLink]}>
            📧 {contact.email}
          </Text>
        </TouchableOpacity>
      )}

      {contact.tel_mobile && (
        <TouchableOpacity onPress={() => onCall(contact.tel_mobile!)}>
          <Text style={[styles.contactDetail, styles.contactLink]}>
            📱 {contact.tel_mobile}
          </Text>
        </TouchableOpacity>
      )}

      {contact.tel_direct && (
        <TouchableOpacity onPress={() => onCall(contact.tel_direct!)}>
          <Text style={[styles.contactDetail, styles.contactLink]}>
            ☎️ {contact.tel_direct}
          </Text>
        </TouchableOpacity>
      )}

      {contact.commentaire && (
        <Text style={styles.contactComment}>{contact.commentaire}</Text>
      )}
    </View>
  );
}
