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
    >
      <View>
        {/* Top Row: Title + Status Badge */}
        <View
        >
          <View>
            <Text
            >
              {rdv.titre}
            </Text>
            {entrepriseName && (
              <Text
              >
                🏢 {entrepriseName}
              </Text>
            )}
          </View>
          <View
          >
            <Text>
              {STATUS_LABELS[rdv.statut]}
            </Text>
          </View>
        </View>

        {/* Date/Time/Duration Row */}
        <View
        >
          <View>
            <Text
            >
              DATE
            </Text>
            <Text>
              {dateStr}
            </Text>
          </View>
          <View>
            <Text
            >
              HEURE
            </Text>
            <Text>
              {timeStr}
            </Text>
          </View>
          <View>
            <Text
            >
              DURÉE
            </Text>
            <Text>
              {rdv.duree_minutes} min
            </Text>
          </View>
        </View>

        {/* Description */}
        {rdv.description && (
          <View>
            <Text
              numberOfLines={2}
            >
              {rdv.description}
            </Text>
          </View>
        )}

        {/* Actions */}
        <View
        >
          {rdv.statut === "planifie" && (
            <>
              <TouchableOpacity
                onPress={() => onChangeStatus?.("termine")}
              >
                <Text
                >
                  Terminer
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onChangeStatus?.("annule")}
              >
                <Text
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
              >
                <Text
                >
                  Terminer
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onChangeStatus?.("annule")}
              >
                <Text
                >
                  Annuler
                </Text>
              </TouchableOpacity>
            </>
          )}
          {rdv.statut === "termine" && (
            <TouchableOpacity
              onPress={() => onChangeStatus?.("planifie")}
            >
              <Text
              >
                Réactiver
              </Text>
            </TouchableOpacity>
          )}
          {rdv.statut === "annule" && (
            <TouchableOpacity
              onPress={() => onChangeStatus?.("planifie")}
            >
              <Text
              >
                Réactiver
              </Text>
            </TouchableOpacity>
          )}
          {rdv.statut === "reporte" && (
            <>
              <TouchableOpacity
                onPress={() => onChangeStatus?.("planifie")}
              >
                <Text
                >
                  Replanifier
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onChangeStatus?.("annule")}
              >
                <Text
                >
                  Annuler
                </Text>
              </TouchableOpacity>
            </>
          )}
          {onEdit && (
            <TouchableOpacity
              onPress={onEdit}
            >
              <Text
              >
                Modifier
              </Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              onPress={onDelete}
            >
              <Text
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
