import { useToast } from "@/components/ui/use-toast";

interface Toast {
  type: string
  title: { profile: string, repository: string },
  description: string
  command?: string
  port: number
}

export function useDeployToast() {
  const { toast } = useToast();

  function toastDeploy(toastNotification: Toast) {
    console.log(toastNotification);
    toast({
      title: `${toastNotification.type} ${toastNotification.title.repository} del usuario ${toastNotification.title.profile}`,
      description: `${toastNotification.description} and your command: ${toastNotification.command}`,
    });
  }

  return toastDeploy;
}
