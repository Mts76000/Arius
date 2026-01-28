import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
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
import {
  useNotes,
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
  useTemplatesByType,
} from "@/hooks/useNotes";
import { Note, CreateNoteInput, NoteType } from "@/services/notes";
import { ValidationRules, FormErrors, hasErrors } from "@/utils/validation";
import { styles } from "@/styles/entrepriseDetailStyles";
import { ContactModal } from "@/components/ContactModal";
import { NoteModal } from "@/components/NoteModal";
import { TabNavigation, TabType } from "@/components/entreprise/TabNavigation";
import { EntrepriseHeader } from "@/components/entreprise/EntrepriseHeader";
import { InfosTab } from "@/components/entreprise/InfosTab";
import { NotesTab } from "@/components/entreprise/NotesTab";

export default function EntrepriseDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { data: entreprise, isLoading, error } = useEntreprise(id as string);
  const { data: contacts, isLoading: contactsLoading } = useContacts(
    id as string,
  );
  const { data: notesData, isLoading: notesLoading } = useNotes(id as string);
  const deleteEntreprise = useDeleteEntreprise();
  const createContact = useCreateContact();
  const updateContact = useUpdateContact();
  const deleteContact = useDeleteContact();

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>("infos");
  const [noteTypeFilter, setNoteTypeFilter] = useState<NoteType | "all">("all");
  const [noteSearchQuery, setNoteSearchQuery] = useState<string>("");

  // Notes
  const createNoteMutation = useCreateNote();
  const updateNoteMutation = useUpdateNote();
  const deleteNoteMutation = useDeleteNote();
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedNoteType, setSelectedNoteType] = useState<NoteType>("info");
  const { data: templates = [] } = useTemplatesByType(selectedNoteType);

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

  // Notes handlers
  const handleAddNote = () => {
    setSelectedNote(null);
    setSelectedNoteType("info");
    setShowNoteModal(true);
  };

  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
    setSelectedNoteType(note.type);
    setShowNoteModal(true);
  };

  const handleDeleteNote = (noteId: string) => {
    const doDelete = async () => {
      try {
        await deleteNoteMutation.mutateAsync({
          id: noteId,
          entrepriseId: id as string,
        });
      } catch (error) {
        Alert.alert("Erreur", "Impossible de supprimer la note");
      }
    };

    if (Platform.OS === "web") {
      const ok = window.confirm(
        "Êtes-vous sûr de vouloir supprimer cette note ?",
      );
      if (ok) doDelete();
      return;
    }

    Alert.alert(
      "Confirmer la suppression",
      "Êtes-vous sûr de vouloir supprimer cette note ?",
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

  const handleSubmitNote = async (data: CreateNoteInput) => {
    try {
      const noteData = {
        ...data,
        entreprise_id: id as string,
      };
      if (selectedNote) {
        await updateNoteMutation.mutateAsync({
          id: selectedNote._id,
          updates: noteData,
        });
      } else {
        await createNoteMutation.mutateAsync(noteData);
      }
      setShowNoteModal(false);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de sauvegarder la note");
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
      <EntrepriseHeader entreprise={entreprise} />

      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      {activeTab === "infos" && (
        <InfosTab
          entreprise={entreprise}
          contacts={contacts}
          contactsLoading={contactsLoading}
          onAddContact={() => openContactModal()}
          onEditContact={openContactModal}
          onDeleteContact={handleDeleteContact}
          onCall={handleCall}
          onEmail={handleEmail}
        />
      )}

      {activeTab === "rdv" && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Rendez-vous</Text>
          <Text style={styles.noContacts}>Fonctionnalité à venir</Text>
        </View>
      )}

      {activeTab === "devis" && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📄 Devis</Text>
          <Text style={styles.noContacts}>Fonctionnalité à venir</Text>
        </View>
      )}

      {activeTab === "notes" && (
        <NotesTab
          notes={notesData?.notes}
          notesLoading={notesLoading}
          noteTypeFilter={noteTypeFilter}
          noteSearchQuery={noteSearchQuery}
          onTypeFilterChange={setNoteTypeFilter}
          onSearchChange={setNoteSearchQuery}
          onAddNote={handleAddNote}
          onEditNote={handleEditNote}
          onDeleteNote={handleDeleteNote}
        />
      )}

      {activeTab === "chiffres" && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Chiffres</Text>
          <Text style={styles.noContacts}>Fonctionnalité à venir</Text>
        </View>
      )}

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

      <NoteModal
        visible={showNoteModal}
        entrepriseId={id as string}
        note={selectedNote}
        templates={templates}
        onSubmit={handleSubmitNote}
        onTypeChange={setSelectedNoteType}
        onClose={() => setShowNoteModal(false)}
        isLoading={createNoteMutation.isPending || updateNoteMutation.isPending}
      />
    </ScrollView>
  );
}
