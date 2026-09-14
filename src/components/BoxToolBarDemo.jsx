import React from "react";
import BoxToolBar from "./BoxToolBar";

export default function BoxToolBarDemo() {
  return (
    <div className="min-h-screen flex items-start justify-start p-8 bg-gray-50">
      <div className="mr-8">
        <h2 className="text-xl font-semibold mb-4">BoxToolBar Test</h2>
        <p className="text-sm text-muted-foreground mb-4">This file is a standalone demo component for the `BoxToolBar`. It does not modify existing app routes.</p>
        <div className="border rounded p-3 bg-white">
          <BoxToolBar />
        </div>
      </div>
      <div className="flex-1 p-8">
        <h3 className="font-medium">Preview Area</h3>
        <p className="text-sm text-muted-foreground mt-2">Use this component by importing `BoxToolBarDemo` into a temporary page or rendering it in your dev environment.</p>
      </div>
    </div>
  );
}
