"use client";

import { useState } from "react";

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface AccordionMenuProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
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
        <div
          key={item.id}
          className="rounded-lg border border-white/10 bg-white/5"
        >
          <button
            type="button"
            onClick={() => toggleItem(item.id)}
            className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-white/8"
          >
            <span className="font-medium text-white">{item.title}</span>
            <ChevronDownIcon
              className={`h-5 w-5 text-white/65 transition-transform ${
                openIds.has(item.id) ? "rotate-180" : ""
              }`}
            />
          </button>

          {openIds.has(item.id) && (
            <div className="border-t border-white/10 bg-black/20 px-4 py-3 text-sm text-white/80">
              {item.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
