import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "../api/usersApi";
import { toast } from "sonner";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: usersApi.getAll,
  });
}

export function useAddUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: usersApi.add,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Team member added successfully");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add team member");
    },
  });
}
