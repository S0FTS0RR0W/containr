import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";

export default function SettingsButton() {
  return (
    <Button variant="ghost" size="icon" className="ml-2">
      <Icon icon="mdi:cog" className="w-5 h-5" />
    </Button>
  );
}
