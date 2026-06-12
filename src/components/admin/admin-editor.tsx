"use client";

import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ds } from "@/lib/design";

export function EditorLayout<T extends { id: string }>({
  title,
  newLabel,
  items,
  editing,
  setEditing,
  empty,
  saving,
  save,
  error,
  renderItem,
  renderForm,
  remove,
}: {
  title: string;
  newLabel: string;
  items?: T[];
  editing: Partial<T> | null;
  setEditing: (v: Partial<T> | null) => void;
  empty: Partial<T>;
  saving: boolean;
  save: () => void;
  error?: string;
  renderItem: (item: T) => React.ReactNode;
  renderForm: () => React.ReactNode;
  remove: (id: string) => void;
}) {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          <Button size="sm" onClick={() => setEditing(empty)}>
            {newLabel}
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {!items?.length && <p className="text-sm text-muted-foreground">暂无数据</p>}
          {items?.map((item) => (
            <div key={item.id} className={ds.adminRow}>
              <div className="min-w-0 flex-1">{renderItem(item)}</div>
              <div className="flex gap-1 shrink-0">
                <Button size="sm" variant="outline" onClick={() => setEditing(item)}>
                  编辑
                </Button>
                <Button size="sm" variant="destructive" onClick={() => remove(item.id)}>
                  删
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {editing && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {"id" in editing && editing.id ? "编辑" : "新增"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {renderForm()}
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2 pt-2">
              <Button onClick={save} disabled={saving}>
                {saving ? "保存中..." : "保存"}
              </Button>
              <Button variant="outline" onClick={() => setEditing(null)}>
                取消
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  rows = 6,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-3xl font-bold mt-1">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export function MatchPicker({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (id: number | null) => void;
}) {
  const { data } = useSWR<{ fixtures: Array<{ id: number; label: string; league: string; status: string }> }>(
    "/api/admin/fixtures/today",
    (url: string) => fetch(url).then((r) => r.json())
  );

  return (
    <div className="space-y-1">
      <Label>从今日赛程选择</Label>
      <select
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
      >
        <option value="">手动输入或选择比赛</option>
        {data?.fixtures?.map((f) => (
          <option key={f.id} value={f.id}>
            #{f.id} {f.label} ({f.league}) {f.status}
          </option>
        ))}
      </select>
    </div>
  );
}
