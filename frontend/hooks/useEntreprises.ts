import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import {
  entreprisesService,
  GetEntreprisesParams,
  CreateEntrepriseInput,
  UpdateEntrepriseInput,
} from "@/services/entreprises";

export function useEntreprises(params?: GetEntreprisesParams) {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: ["entreprises", params],
    queryFn: () => entreprisesService.getAll(token!, params),
    enabled: !!token,
  });
}

export function useEntreprise(id: string) {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: ["entreprises", id],
    queryFn: () => entreprisesService.getById(token!, id),
    enabled: !!token && !!id,
  });
}

export function useCreateEntreprise() {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEntrepriseInput) =>
      entreprisesService.create(token!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entreprises"] });
    },
  });
}

export function useUpdateEntreprise() {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEntrepriseInput }) =>
      entreprisesService.update(token!, id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["entreprises"] });
      queryClient.invalidateQueries({
        queryKey: ["entreprises", variables.id],
      });
    },
  });
}

export function useDeleteEntreprise() {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => entreprisesService.delete(token!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entreprises"] });
    },
  });
}
