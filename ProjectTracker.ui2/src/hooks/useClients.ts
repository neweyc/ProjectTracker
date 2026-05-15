import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientsApi } from "../api/clientsApi";
import { toast } from "sonner";

export function useClients() {
  return useQuery({
    queryKey: ["clients"],
    queryFn: clientsApi.getAll,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clientsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Client created successfully");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create client");
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string; email?: string | null; address?: string | null } }) =>
      clientsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Client updated successfully");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update client");
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clientsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Client deleted successfully");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete client");
    },
  });
}
