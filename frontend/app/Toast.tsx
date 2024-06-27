import { useToast } from "@/components/ui/use-toast";

interface Toast {
  title: { profile: string, repository: string },
  description: string
  command: string
  port: number
}

export function useDeployToast() {
  const { toast } = useToast();

  function toastDeploy(toastNotification: Toast) {
    console.log(toastNotification);
    toast({
      title: `Clonando ${toastNotification.title.repository} del usuario ${toastNotification.title.profile}`,
      description: `Guardando en la carpeta: ${toastNotification.description} y su comando: ${toastNotification.command}`,
    });
  }

  return toastDeploy;
}
