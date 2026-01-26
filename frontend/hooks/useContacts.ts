import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import {
  contactsService,
  CreateContactInput,
  UpdateContactInput,
} from "@/services/contacts";

export function useContacts(entrepriseId: string) {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: ["contacts", entrepriseId],
    queryFn: () => contactsService.getByEntreprise(token!, entrepriseId),
    enabled: !!token && !!entrepriseId,
  });
}

export function useContact(id: string) {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: ["contacts", "detail", id],
    queryFn: () => contactsService.getById(token!, id),
    enabled: !!token && !!id,
  });
}

export function useCreateContact() {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      entrepriseId,
      data,
    }: {
      entrepriseId: string;
      data: CreateContactInput;
    }) => contactsService.create(token!, entrepriseId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["contacts", variables.entrepriseId],
      });
    },
  });
}

export function useUpdateContact() {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateContactInput }) =>
      contactsService.update(token!, id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["contacts", data.entreprise_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["contacts", "detail", data.id],
      });
    },
  });
}

export function useDeleteContact() {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, entrepriseId }: { id: string; entrepriseId: string }) =>
      contactsService.delete(token!, id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["contacts", variables.entrepriseId],
      });
    },
  });
}
