import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { devisService, UploadDevisInput } from "@/services/devis";

export function useDevis(entrepriseId: string, search?: string) {
  return useQuery({
    queryKey: ["devis", entrepriseId, search],
    queryFn: () => devisService.getByEntreprise(entrepriseId, search),
    enabled: !!entrepriseId,
  });
}

export function useUploadDevis(entrepriseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UploadDevisInput) =>
      devisService.upload(entrepriseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devis", entrepriseId] });
    },
  });
}

export function useDeleteDevis(entrepriseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => devisService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devis", entrepriseId] });
    },
  });
}
