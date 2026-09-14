import React from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Box, ImagePlus, Type, Palette, Settings } from "lucide-react";

export default function BoxToolBar() {
  const items = [
    { id: "design", label: "Design", icon: <ImagePlus /> },
    { id: "text", label: "Text", icon: <Type /> },
    { id: "color", label: "Color", icon: <Palette /> },
    { id: "layout", label: "Layout", icon: <Box /> },
    { id: "settings", label: "Settings", icon: <Settings /> },
  ];

  return (
    <div className="w-16 bg-white/80 dark:bg-slate-900 border rounded-r-lg shadow-lg p-2 flex flex-col gap-2 items-center">
      {items.map((it) => (
        <Popover key={it.id}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className="w-11 h-11 p-0 flex items-center justify-center rounded-md hover:bg-muted"
              aria-label={it.label}
            >
              {it.icon}
            </Button>
          </PopoverTrigger>

          <PopoverContent side="right" align="center" className="w-72 p-4 rounded-md shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-semibold">{it.label}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Quick actions for {it.label.toLowerCase()}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {it.id === "color" && (
                <div className="flex gap-2 flex-wrap">
                  {["#ffffff", "#111827", "#f97316", "#06b6d4", "#34d399"].map((c) => (
                    <button
                      key={c}
                      onClick={() => console.log("pick", c)}
                      className="w-8 h-8 rounded-full border"
                      style={{ backgroundColor: c }}
                      aria-label={`color-${c}`}
                    />
                  ))}
                </div>
              )}

              {it.id === "text" && (
                <div className="flex flex-col gap-2">
                  <button className="px-3 py-1 rounded bg-primary text-white">Add Text</button>
                  <select className="w-full border rounded px-2 py-1">
                    <option>Arial</option>
                    <option>Poppins</option>
                    <option>Roboto</option>
                  </select>
                </div>
              )}

              {it.id === "design" && (
                <div className="flex flex-col gap-2">
                  <button className="px-3 py-1 rounded border">Upload Image</button>
                  <button className="px-3 py-1 rounded border">Insert Shape</button>
                </div>
              )}

              {it.id === "layout" && (
                <div className="flex flex-col gap-2 text-sm">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" /> Snap to grid
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" /> Show guides
                  </label>
                </div>
              )}

              {it.id === "settings" && (
                <div className="flex flex-col gap-2">
                  <button className="px-3 py-1 rounded border">Export</button>
                  <button className="px-3 py-1 rounded border">Preferences</button>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  );
}
