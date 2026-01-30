import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  caService,
  CreateCAInput,
  UpdateCAInput,
  GetCAParams,
} from "@/services/ca";

export function useCA(params?: GetCAParams) {
  return useQuery({
    queryKey: ["ca", params],
    queryFn: () => caService.getCA(params),
  });
}

export function useCAStats(annee: number, mois: number) {
  return useQuery({
    queryKey: ["ca-stats", annee, mois],
    queryFn: () => caService.getCAStats(annee, mois),
  });
}

export function useCAEntreprise(entrepriseId: string, annee: number) {
  return useQuery({
    queryKey: ["ca-entreprise", entrepriseId, annee],
    queryFn: () => caService.getCAEntreprise(entrepriseId, annee),
    enabled: !!entrepriseId,
  });
}

export function useCreateCA() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCAInput) => caService.createCA(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ca"] });
      queryClient.invalidateQueries({ queryKey: ["ca-stats"] });
      queryClient.invalidateQueries({ queryKey: ["ca-entreprise"] });
    },
  });
}

export function useUpdateCA() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCAInput }) =>
      caService.updateCA(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ca"] });
      queryClient.invalidateQueries({ queryKey: ["ca-stats"] });
      queryClient.invalidateQueries({ queryKey: ["ca-entreprise"] });
    },
  });
}

export function useDeleteCA() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => caService.deleteCA(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ca"] });
      queryClient.invalidateQueries({ queryKey: ["ca-stats"] });
      queryClient.invalidateQueries({ queryKey: ["ca-entreprise"] });
    },
  });
}
