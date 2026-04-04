"use client";

import { useState, useRef, useTransition } from "react";
import { createTagAction } from "@/lib/actions";
import type { Tag } from "@/types";
import { X, Plus, Search } from "lucide-react";

const TAG_COLORS = [
  "#6366F1", "#10B981", "#F59E0B", "#EF4444", "#3B82F6",
  "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16", "#F97316",
];

interface TagSelectorProps {
  allTags: Tag[];
  selectedTagIds: number[];
  onChange: (ids: number[]) => void;
}

export function TagSelector({ allTags, selectedTagIds, onChange }: TagSelectorProps) {
  const [search, setSearch] = useState("");
  const [tags, setTags] = useState<Tag[]>(allTags);
  const [newColor, setNewColor] = useState(TAG_COLORS[0]);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedTags = tags.filter((t) => selectedTagIds.includes(t.id));
  const filtered = tags.filter(
    (t) =>
      !selectedTagIds.includes(t.id) &&
      t.name.toLowerCase().includes(search.toLowerCase())
  );
  const canCreate = search.trim().length > 0 && !tags.find((t) => t.name.toLowerCase() === search.trim().toLowerCase());

  const toggle = (id: number) => {
    if (selectedTagIds.includes(id)) {
      onChange(selectedTagIds.filter((i) => i !== id));
    } else {
      onChange([...selectedTagIds, id]);
    }
  };

  const handleCreate = () => {
    const name = search.trim();
    if (!name) return;
    startTransition(async () => {
      const result = await createTagAction(name, newColor);
      if (result.tag) {
        setTags((prev) => [...prev, result.tag]);
        onChange([...selectedTagIds, result.tag.id]);
        setSearch("");
      }
    });
  };

  return (
    <div className="space-y-3">
      {/* Selected tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium border"
              style={{
                borderColor: tag.color + "40",
                color: tag.color,
                backgroundColor: tag.color + "15",
              }}
            >
              {tag.name}
              <button
                type="button"
                onClick={() => toggle(tag.id)}
                className="rounded-full hover:opacity-70 transition"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted/50" />
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm hoặc tạo tag mới..."
          className="w-full rounded-lg border border-border bg-background pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
        />
      </div>

      {/* Dropdown results */}
      {search && (
        <div className="rounded-lg border border-border bg-background shadow-md overflow-hidden">
          {filtered.length > 0 && (
            <div className="max-h-40 overflow-y-auto">
              {filtered.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => { toggle(tag.id); setSearch(""); }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-sm hover:bg-surface transition text-left"
                >
                  <span
                    className="h-3 w-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: tag.color }}
                  />
                  {tag.name}
                </button>
              ))}
            </div>
          )}
          {canCreate && (
            <div className="border-t border-border p-2 space-y-2">
              <p className="px-1 text-xs text-muted">Tạo tag mới:</p>
              <div className="flex items-center gap-2 px-1">
                <div className="flex gap-1">
                  {TAG_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewColor(c)}
                      className="h-5 w-5 rounded-full border-2 transition"
                      style={{
                        backgroundColor: c,
                        borderColor: newColor === c ? "white" : "transparent",
                        outline: newColor === c ? `2px solid ${c}` : "none",
                      }}
                    />
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={handleCreate}
                disabled={isPending}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white transition"
                style={{ backgroundColor: newColor }}
              >
                <Plus className="h-4 w-4" />
                Tạo &ldquo;{search.trim()}&rdquo;
              </button>
            </div>
          )}
          {filtered.length === 0 && !canCreate && (
            <p className="px-3 py-3 text-sm text-muted">Không tìm thấy tag.</p>
          )}
        </div>
      )}

      {/* All tags (when not searching) */}
      {!search && (
        <div className="flex flex-wrap gap-2">
          {tags
            .filter((t) => !selectedTagIds.includes(t.id))
            .map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggle(tag.id)}
                className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium border border-border text-muted hover:border-primary/40 hover:text-foreground transition"
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tag.color }} />
                {tag.name}
              </button>
            ))}
          {tags.length === 0 && (
            <p className="text-sm text-muted">Chưa có tag nào. Gõ để tạo tag mới.</p>
          )}
        </div>
      )}
    </div>
  );
}
