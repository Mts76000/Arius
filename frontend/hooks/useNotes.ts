import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import {
  notesService,
  CreateNoteInput,
  GetNotesFilters,
} from "@/services/notes";

export function useNotes(entrepriseId: string, filters?: GetNotesFilters) {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: ["notes", entrepriseId, filters],
    queryFn: () =>
      notesService.getNotesByEntreprise(token!, entrepriseId, filters),
    enabled: !!token && !!entrepriseId,
  });
}

export function useNote(id: string) {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: ["notes", "detail", id],
    queryFn: () => notesService.getNoteById(token!, id),
    enabled: !!token && !!id,
  });
}

export function useCreateNote() {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateNoteInput) =>
      notesService.createNote(token!, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["notes", variables.entreprise_id],
      });
    },
  });
}

export function useUpdateNote() {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<CreateNoteInput>;
    }) => notesService.updateNote(token!, id, updates),
    onSuccess: (note) => {
      queryClient.invalidateQueries({
        queryKey: ["notes", note.entreprise_id],
      });
    },
  });
}

export function useDeleteNote() {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, entrepriseId }: { id: string; entrepriseId: string }) =>
      notesService.deleteNote(token!, id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["notes", variables.entrepriseId],
      });
    },
  });
}

export function useSearchNotes() {
  const token = useAuthStore((state) => state.token);

  return useMutation({
    mutationFn: (query: string) => notesService.searchNotes(token!, query),
  });
}

export function useTemplatesByType(type: string) {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: ["notes", "templates", type],
    queryFn: () => notesService.getTemplatesByType(token!, type as any),
    enabled: !!token && !!type,
  });
}

export function useDashboardClientsSuivi(jours_seuil?: number) {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: ["notes", "dashboard", jours_seuil],
    queryFn: () => notesService.getDashboardClientsSuivi(token!, jours_seuil),
    enabled: !!token,
  });
}
