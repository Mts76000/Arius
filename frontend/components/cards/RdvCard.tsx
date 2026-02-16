import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Rdv, RdvStatus } from "@/services/rdvs";

interface RdvCardProps {
  rdv: Rdv;
  entrepriseName?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onChangeStatus?: (status: RdvStatus) => void;
}

const STATUS_COLORS: Record<RdvStatus, string> = {
  planifie: "#3b82f6",
  en_cours: "#f97316",
  termine: "#10b981",
  annule: "#ef4444",
  reporte: "#eab308",
};

const STATUS_LABELS: Record<RdvStatus, string> = {
  planifie: "Prévu",
  en_cours: "En cours",
  termine: "Terminé",
  annule: "Annulé",
  reporte: "Reporté",
};

export const RdvCard: React.FC<RdvCardProps> = ({
  rdv,
  entrepriseName,
  onEdit,
  onDelete,
  onChangeStatus,
}) => {
  const dateObj = new Date(rdv.date_prevue);
  const dateStr = dateObj.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timeStr = dateObj.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View
      style={{
        backgroundColor: "#ffffff",
        borderColor: STATUS_COLORS[rdv.statut] + "20",
        borderWidth: 2,
        borderLeftColor: STATUS_COLORS[rdv.statut],
        borderLeftWidth: 4,
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <View style={{ padding: 16 }}>
        {/* Top Row: Title + Status Badge */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: "#0f172a",
                marginBottom: 4,
              }}
            >
              {rdv.titre}
            </Text>
            {entrepriseName && (
              <Text
                style={{ fontSize: 13, color: "#64748b", fontWeight: "500" }}
              >
                🏢 {entrepriseName}
              </Text>
            )}
          </View>
          <View
            style={{
              backgroundColor: STATUS_COLORS[rdv.statut],
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
              marginLeft: 12,
            }}
          >
            <Text style={{ color: "#ffffff", fontSize: 12, fontWeight: "600" }}>
              {STATUS_LABELS[rdv.statut]}
            </Text>
          </View>
        </View>

        {/* Date/Time/Duration Row */}
        <View
          style={{
            flexDirection: "row",
            gap: 16,
            marginBottom: 12,
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: "#f1f5f9",
          }}
        >
          <View>
            <Text
              style={{
                fontSize: 11,
                color: "#94a3b8",
                fontWeight: "600",
                marginBottom: 2,
              }}
            >
              DATE
            </Text>
            <Text style={{ fontSize: 14, color: "#0f172a", fontWeight: "600" }}>
              {dateStr}
            </Text>
          </View>
          <View>
            <Text
              style={{
                fontSize: 11,
                color: "#94a3b8",
                fontWeight: "600",
                marginBottom: 2,
              }}
            >
              HEURE
            </Text>
            <Text style={{ fontSize: 14, color: "#0f172a", fontWeight: "600" }}>
              {timeStr}
            </Text>
          </View>
          <View>
            <Text
              style={{
                fontSize: 11,
                color: "#94a3b8",
                fontWeight: "600",
                marginBottom: 2,
              }}
            >
              DURÉE
            </Text>
            <Text style={{ fontSize: 14, color: "#0f172a", fontWeight: "600" }}>
              {rdv.duree_minutes} min
            </Text>
          </View>
        </View>

        {/* Description */}
        {rdv.description && (
          <View style={{ marginBottom: 12 }}>
            <Text
              style={{
                fontSize: 13,
                color: "#475569",
                lineHeight: 18,
              }}
              numberOfLines={2}
            >
              {rdv.description}
            </Text>
          </View>
        )}

        {/* Actions */}
        <View
          style={{
            flexDirection: "row",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          {rdv.statut === "planifie" && (
            <>
              <TouchableOpacity
                onPress={() => onChangeStatus?.("termine")}
                style={{
                  flex: 1,
                  backgroundColor: "#d1fae5",
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderRadius: 8,
                  minWidth: 100,
                }}
              >
                <Text
                  style={{
                    color: "#10b981",
                    fontWeight: "600",
                    fontSize: 13,
                    textAlign: "center",
                  }}
                >
                  Terminer
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onChangeStatus?.("annule")}
                style={{
                  flex: 1,
                  backgroundColor: "#fee2e2",
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderRadius: 8,
                  minWidth: 100,
                }}
              >
                <Text
                  style={{
                    color: "#ef4444",
                    fontWeight: "600",
                    fontSize: 13,
                    textAlign: "center",
                  }}
                >
                  Annuler
                </Text>
              </TouchableOpacity>
            </>
          )}
          {rdv.statut === "en_cours" && (
            <>
              <TouchableOpacity
                onPress={() => onChangeStatus?.("termine")}
                style={{
                  flex: 1,
                  backgroundColor: "#d1fae5",
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderRadius: 8,
                  minWidth: 100,
                }}
              >
                <Text
                  style={{
                    color: "#10b981",
                    fontWeight: "600",
                    fontSize: 13,
                    textAlign: "center",
                  }}
                >
                  Terminer
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onChangeStatus?.("annule")}
                style={{
                  flex: 1,
                  backgroundColor: "#fee2e2",
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderRadius: 8,
                  minWidth: 100,
                }}
              >
                <Text
                  style={{
                    color: "#ef4444",
                    fontWeight: "600",
                    fontSize: 13,
                    textAlign: "center",
                  }}
                >
                  Annuler
                </Text>
              </TouchableOpacity>
            </>
          )}
          {rdv.statut === "termine" && (
            <TouchableOpacity
              onPress={() => onChangeStatus?.("planifie")}
              style={{
                flex: 1,
                backgroundColor: "#dbeafe",
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderRadius: 8,
                minWidth: 100,
              }}
            >
              <Text
                style={{
                  color: "#3b82f6",
                  fontWeight: "600",
                  fontSize: 13,
                  textAlign: "center",
                }}
              >
                Réactiver
              </Text>
            </TouchableOpacity>
          )}
          {rdv.statut === "annule" && (
            <TouchableOpacity
              onPress={() => onChangeStatus?.("planifie")}
              style={{
                flex: 1,
                backgroundColor: "#dbeafe",
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderRadius: 8,
                minWidth: 100,
              }}
            >
              <Text
                style={{
                  color: "#3b82f6",
                  fontWeight: "600",
                  fontSize: 13,
                  textAlign: "center",
                }}
              >
                Réactiver
              </Text>
            </TouchableOpacity>
          )}
          {rdv.statut === "reporte" && (
            <>
              <TouchableOpacity
                onPress={() => onChangeStatus?.("planifie")}
                style={{
                  flex: 1,
                  backgroundColor: "#dbeafe",
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderRadius: 8,
                  minWidth: 100,
                }}
              >
                <Text
                  style={{
                    color: "#3b82f6",
                    fontWeight: "600",
                    fontSize: 13,
                    textAlign: "center",
                  }}
                >
                  Replanifier
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onChangeStatus?.("annule")}
                style={{
                  flex: 1,
                  backgroundColor: "#fee2e2",
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderRadius: 8,
                  minWidth: 100,
                }}
              >
                <Text
                  style={{
                    color: "#ef4444",
                    fontWeight: "600",
                    fontSize: 13,
                    textAlign: "center",
                  }}
                >
                  Annuler
                </Text>
              </TouchableOpacity>
            </>
          )}
          {onEdit && (
            <TouchableOpacity
              onPress={onEdit}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 8,
                backgroundColor: "#e0e7ff",
              }}
            >
              <Text
                style={{ color: "#4f46e5", fontWeight: "600", fontSize: 13 }}
              >
                Modifier
              </Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              onPress={onDelete}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 8,
                backgroundColor: "#fee2e2",
              }}
            >
              <Text
                style={{ color: "#dc2626", fontWeight: "600", fontSize: 13 }}
              >
                🗑️
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};
