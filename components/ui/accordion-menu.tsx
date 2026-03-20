import { ChevronDown } from "lucide-react";
import { useState } from "react";

("use client");

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface AccordionMenuProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
}

export function AccordionMenu({
  items,
  allowMultiple = false,
}: AccordionMenuProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    const newOpenIds = new Set(openIds);

    if (newOpenIds.has(id)) {
      newOpenIds.delete(id);
    } else {
      if (!allowMultiple) {
        newOpenIds.clear();
      }
      newOpenIds.add(id);
    }

    setOpenIds(newOpenIds);
  };

  return (
    <div className="w-full space-y-2">
      {items.map((item) => (
        <div key={item.id} className="border rounded-lg">
          <button
            type="button"
            onClick={() => toggleItem(item.id)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium text-gray-900">{item.title}</span>
            <ChevronDown
              className={`w-5 h-5 text-gray-600 transition-transform ${
                openIds.has(item.id) ? "rotate-180" : ""
              }`}
            />
          </button>

          {openIds.has(item.id) && (
            <div className="px-4 py-3 bg-gray-50 border-t text-gray-700">
              {item.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
