import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  objectifsService,
  CreateObjectifInput,
  UpdateObjectifInput,
} from "@/services/objectifs";

export function useObjectifs(annee?: number) {
  return useQuery({
    queryKey: ["objectifs", annee],
    queryFn: () => objectifsService.getObjectifs(annee),
  });
}

export function useCreateObjectif() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateObjectifInput) =>
      objectifsService.createObjectif(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["objectifs"] });
      queryClient.invalidateQueries({ queryKey: ["ca-stats"] });
    },
  });
}

export function useUpdateObjectif() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateObjectifInput }) =>
      objectifsService.updateObjectif(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["objectifs"] });
      queryClient.invalidateQueries({ queryKey: ["ca-stats"] });
    },
  });
}

export function useDeleteObjectif() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => objectifsService.deleteObjectif(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["objectifs"] });
      queryClient.invalidateQueries({ queryKey: ["ca-stats"] });
    },
  });
}
