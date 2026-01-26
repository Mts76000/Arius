import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Image,
  Linking,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEntreprise, useDeleteEntreprise } from "@/hooks/useEntreprises";
import {
  useContacts,
  useCreateContact,
  useUpdateContact,
  useDeleteContact,
} from "@/hooks/useContacts";
import { Contact, CreateContactInput } from "@/services/contacts";
import { ValidationRules, FormErrors, hasErrors } from "@/utils/validation";
import Constants from "expo-constants";
import { styles } from "@/styles/entrepriseDetailStyles";
import { ContactCard } from "@/components/ContactCard";
import { ContactModal } from "@/components/ContactModal";

const baseURL = Constants.expoConfig?.extra?.apiUrl ?? "http://localhost:3000";

export default function EntrepriseDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { data: entreprise, isLoading, error } = useEntreprise(id as string);
  const { data: contacts, isLoading: contactsLoading } = useContacts(
    id as string,
  );
  const deleteEntreprise = useDeleteEntreprise();
  const createContact = useCreateContact();
  const updateContact = useUpdateContact();
  const deleteContact = useDeleteContact();

  const [showContactModal, setShowContactModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [contactForm, setContactForm] = useState<CreateContactInput>({
    nom: "",
    prenom: "",
    email: "",
    tel_mobile: "",
    tel_direct: "",
    poste: "",
    contact_principal: false,
    commentaire: "",
  });
  const [contactErrors, setContactErrors] = useState<FormErrors>({});

  const handleContactChange = (
    field: keyof CreateContactInput,
    value: string,
  ) => {
    setContactForm({ ...contactForm, [field]: value });
  };

  const toggleContactPrincipal = () => {
    setContactForm({
      ...contactForm,
      contact_principal: !contactForm.contact_principal,
    });
  };

  const confirmEntrepriseDeletion = async () => {
    try {
      await deleteEntreprise.mutateAsync(id as string);
      router.back();
    } catch (error) {
      Alert.alert("Erreur", "Impossible de supprimer l'entreprise");
    }
  };

  const handleDelete = () => {
    if (Platform.OS === "web") {
      const ok = window.confirm(
        "Êtes-vous sûr de vouloir supprimer cette entreprise ?",
      );
      if (ok) {
        confirmEntrepriseDeletion();
      }
      return;
    }

    Alert.alert(
      "Confirmer la suppression",
      "Êtes-vous sûr de vouloir supprimer cette entreprise ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: confirmEntrepriseDeletion,
        },
      ],
    );
  };

  const openContactModal = (contact?: Contact) => {
    if (contact) {
      setEditingContact(contact);
      setContactForm({
        nom: contact.nom,
        prenom: contact.prenom || "",
        email: contact.email || "",
        tel_mobile: contact.tel_mobile || "",
        tel_direct: contact.tel_direct || "",
        poste: contact.poste || "",
        contact_principal: contact.contact_principal,
        commentaire: contact.commentaire || "",
      });
    } else {
      setEditingContact(null);
      setContactForm({
        nom: "",
        prenom: "",
        email: "",
        tel_mobile: "",
        tel_direct: "",
        poste: "",
        contact_principal: false,
        commentaire: "",
      });
    }
    setContactErrors({});
    setShowContactModal(true);
  };

  const validateContactForm = (): boolean => {
    const errors: FormErrors = {};

    // Nom requis
    const nomError = ValidationRules.required(contactForm.nom, "Le nom");
    if (nomError) errors.nom = nomError;

    // Email optionnel mais doit être valide si rempli
    if (contactForm.email && contactForm.email.trim().length > 0) {
      const emailError = ValidationRules.email(contactForm.email);
      if (emailError) errors.email = emailError;
    }

    setContactErrors(errors);
    return !hasErrors(errors);
  };

  const handleSaveContact = async () => {
    if (!validateContactForm()) {
      return;
    }

    try {
      // Nettoyer les données - enlever les chaînes vides
      const cleanData: any = {
        nom: contactForm.nom,
      };

      if (contactForm.prenom && contactForm.prenom.trim()) {
        cleanData.prenom = contactForm.prenom;
      }
      if (contactForm.email && contactForm.email.trim()) {
        cleanData.email = contactForm.email;
      }
      if (contactForm.tel_mobile && contactForm.tel_mobile.trim()) {
        cleanData.tel_mobile = contactForm.tel_mobile;
      }
      if (contactForm.tel_direct && contactForm.tel_direct.trim()) {
        cleanData.tel_direct = contactForm.tel_direct;
      }
      if (contactForm.poste && contactForm.poste.trim()) {
        cleanData.poste = contactForm.poste;
      }
      if (contactForm.commentaire && contactForm.commentaire.trim()) {
        cleanData.commentaire = contactForm.commentaire;
      }
      cleanData.contact_principal = contactForm.contact_principal;

      if (editingContact) {
        await updateContact.mutateAsync({
          id: editingContact.id,
          data: cleanData,
        });
      } else {
        await createContact.mutateAsync({
          entrepriseId: id as string,
          data: cleanData,
        });
      }
      setShowContactModal(false);
      setContactErrors({});
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.error || "Impossible de sauvegarder le contact";
      Alert.alert(
        "Erreur",
        typeof errorMsg === "string" ? errorMsg : JSON.stringify(errorMsg),
      );
    }
  };

  const handleDeleteContact = (contactId: string) => {
    const doDelete = async () => {
      try {
        await deleteContact.mutateAsync({
          id: contactId,
          entrepriseId: id as string,
        });
      } catch (error) {
        Alert.alert("Erreur", "Impossible de supprimer le contact");
      }
    };

    if (Platform.OS === "web") {
      const ok = window.confirm(
        "Êtes-vous sûr de vouloir supprimer ce contact ?",
      );
      if (ok) doDelete();
      return;
    }

    Alert.alert(
      "Confirmer la suppression",
      "Êtes-vous sûr de vouloir supprimer ce contact ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: doDelete,
        },
      ],
    );
  };

  const handleCall = (tel: string) => {
    Linking.openURL(`tel:${tel}`);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const getStatutLabel = (statut: string) => {
    return statut === "a_reactiver" ? "À réactiver" : statut;
  };

  const getStatutStyle = (statut: string) => {
    switch (statut) {
      case "client":
        return styles.badgeClient;
      case "prospect":
        return styles.badgeProspect;
      case "fournisseur":
        return styles.badgeFournisseur;
      case "a_reactiver":
        return styles.badgeReactiver;
      default:
        return styles.badgeClient;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (error || !entreprise) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Entreprise introuvable</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2}>
          {entreprise.nom}
        </Text>
        <View style={[styles.badge, getStatutStyle(entreprise.statut)]}>
          <Text style={styles.badgeText}>
            {getStatutLabel(entreprise.statut)}
          </Text>
        </View>
      </View>

      {/* Logo */}
      {entreprise.logo && (
        <View style={styles.logoSection}>
          <Image
            source={{
              uri: entreprise.logo.startsWith("http")
                ? entreprise.logo
                : `${baseURL}${entreprise.logo}`,
            }}
            style={styles.logoImage}
          />
        </View>
      )}

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
          <TouchableOpacity
            style={styles.addContactButton}
            onPress={() => openContactModal()}
          >
            <Text style={styles.addContactButtonText}>+ Ajouter</Text>
          </TouchableOpacity>
        </View>

        {contactsLoading ? (
          <ActivityIndicator size="small" color="#2563eb" />
        ) : contacts && contacts.length > 0 ? (
          <View style={styles.contactsList}>
            {contacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onEdit={openContactModal}
                onDelete={handleDeleteContact}
                onCall={handleCall}
                onEmail={handleEmail}
              />
            ))}
          </View>
        ) : (
          <Text style={styles.noContacts}>Aucun contact</Text>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push(`/entreprises/edit/${id}` as any)}
        >
          <Text style={styles.editButtonText}>Modifier</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          disabled={deleteEntreprise.isPending}
        >
          <Text style={styles.deleteButtonText}>
            {deleteEntreprise.isPending ? "..." : "Supprimer"}
          </Text>
        </TouchableOpacity>
      </View>

      <ContactModal
        visible={showContactModal}
        onClose={() => setShowContactModal(false)}
        onSave={handleSaveContact}
        isEditing={!!editingContact}
        contactForm={contactForm}
        contactErrors={contactErrors}
        onChange={handleContactChange}
        onTogglePrincipal={toggleContactPrincipal}
      />
    </ScrollView>
  );
}
