import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1f2937",
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  badgeClient: {
    backgroundColor: "#10b981",
  },
  badgeProspect: {
    backgroundColor: "#f59e0b",
  },
  badgeFournisseur: {
    backgroundColor: "#3b82f6",
  },
  badgeReactiver: {
    backgroundColor: "#8b5cf6",
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  logoSection: {
    alignItems: "center",
    paddingVertical: 16,
  },
  logoImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 12,
  },
  text: {
    color: "#6b7280",
    fontSize: 15,
    lineHeight: 22,
  },
  addressCard: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    gap: 6,
  },
  addressText: {
    color: "#4b5563",
    fontSize: 15,
    lineHeight: 22,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
  },
  editButton: {
    flex: 1,
  },
  deleteButton: {
    flex: 1,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  contactsList: {
    gap: 12,
  },
  contactCard: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    gap: 8,
  },
  contactHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  contactInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
  },
  principalBadge: {
    backgroundColor: "#10b981",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  principalBadgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "700",
  },
  contactActions: {
    flexDirection: "row",
    gap: 12,
  },
  contactActionText: {
    fontSize: 18,
  },
  contactDetail: {
    fontSize: 14,
    color: "#6b7280",
  },
  contactLink: {
    color: "#2563eb",
    textDecorationLine: "underline",
  },
  contactComment: {
    fontSize: 13,
    color: "#9ca3af",
    fontStyle: "italic",
    marginTop: 4,
  },
  noContacts: {
    color: "#9ca3af",
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
  },
  modalForm: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  required: {
    color: "#dc2626",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#1f2937",
    backgroundColor: "#ffffff",
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  inputError: {
    borderColor: "#ef4444",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#cbd5f5",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  checkboxChecked: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  checkboxCheck: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#374151",
  },
});
