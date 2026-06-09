import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import {
  rdvsService,
  CreateRdvInput,
  UpdateRdvInput,
  RdvStatus,
} from "@/services/rdvs";

export function useMyRdvs(filters?: {
  statut?: RdvStatus;
  de?: string;
  a?: string;
  page?: number;
  limite?: number;
}) {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: ["rdvs", "my", filters],
    queryFn: () => rdvsService.getMyRdvs(token!, filters),
    enabled: !!token,
  });
}

export function useRdvsByEntreprise(
  entrepriseId: string,
  filters?: {
    de?: string;
    a?: string;
    page?: number;
    limite?: number;
  },
) {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: ["rdvs", "entreprise", entrepriseId, filters],
    queryFn: () =>
      rdvsService.getRdvsByEntreprise(token!, entrepriseId, filters),
    enabled: !!token && !!entrepriseId,
  });
}

export function useRdvById(id: string) {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: ["rdv", id],
    queryFn: () => rdvsService.getRdvById(token!, id),
    enabled: !!token && !!id,
  });
}

export function useCreateRdv() {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rdv: CreateRdvInput) => rdvsService.createRdv(token!, rdv),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rdvs"] });
    },
  });
}

export function useUpdateRdv() {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateRdvInput }) =>
      rdvsService.updateRdv(token!, id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rdvs"] });
    },
  });
}

export function useDeleteRdv() {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => rdvsService.deleteRdv(token!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rdvs"] });
    },
  });
}
