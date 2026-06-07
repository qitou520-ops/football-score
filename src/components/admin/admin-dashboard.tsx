"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";
import {
  AD_POSITIONS,
  type AdItem,
  type NewsItem,
  type PredictionItem,
  type FeaturedMatchItem,
} from "@/lib/cms/types";
import { ds } from "@/lib/design";

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("Unauthorized");
    return r.json();
  });

const ADMIN_TABS = [
  { id: "overview", label: "概览" },
  { id: "ads", label: "广告管理" },
  { id: "news", label: "新闻管理" },
  { id: "predictions", label: "赛事分析" },
  { id: "featured", label: "推荐比赛" },
  { id: "api", label: "API 设置" },
];

export function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState("overview");

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className={ds.pageTitle}>管理后台</h1>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-primary hover:underline">
              查看前台
            </Link>
            <Button variant="outline" size="sm" onClick={logout}>
              退出登录
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-6">
        <Tabs tabs={ADMIN_TABS} activeTab={tab} onChange={setTab} className="mb-6 flex-wrap" />
        {tab === "overview" && <OverviewTab />}
        {tab === "ads" && <AdsTab />}
        {tab === "news" && <NewsTab />}
        {tab === "predictions" && <PredictionsTab />}
        {tab === "featured" && <FeaturedTab />}
        {tab === "api" && <ApiSettingsTab />}
      </main>
    </div>
  );
}

function OverviewTab() {
  const { data: stats } = useSWR("/api/admin/stats", fetcher, { refreshInterval: 30000 });

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <StatCard label="今日比赛" value={stats?.todayMatches ?? "-"} />
      <StatCard label="实时比赛" value={stats?.liveMatches ?? "-"} />
      <StatCard label="API 请求（今日）" value={stats?.apiRequests ?? "-"} />
      <StatCard label="广告" value={stats?.ads ?? "-"} sub={`${stats?.activeAds ?? 0} 启用`} />
      <StatCard label="新闻" value={stats?.news ?? "-"} sub={`${stats?.publishedNews ?? 0} 已发布`} />
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
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

function AdsTab() {
  const { data: ads, mutate } = useSWR<AdItem[]>("/api/admin/ads", fetcher);
  const [editing, setEditing] = useState<Partial<AdItem> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const empty: Partial<AdItem> = {
    name: "",
    position: "homepage-top",
    title: "",
    htmlCode: "",
    imageUrl: "",
    linkUrl: "",
    active: true,
    priority: 0,
  };

  const save = async () => {
    if (!editing?.name) return;
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/ads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "保存失败");
      return;
    }
    setEditing(null);
    mutate();
  };

  const remove = async (id: string) => {
    if (!confirm("确定删除此广告？")) return;
    await fetch(`/api/admin/ads?id=${id}`, { method: "DELETE" });
    mutate();
  };

  return (
    <EditorLayout
      title="广告列表"
      newLabel="新增广告"
      items={ads}
      editing={editing}
      setEditing={setEditing}
      empty={empty}
      saving={saving}
      save={save}
      error={error}
      renderItem={(ad) => (
        <>
          <p className="font-medium truncate">{ad.title || ad.name}</p>
          <p className="text-xs text-muted-foreground">
            {AD_POSITIONS.find((p) => p.id === ad.position)?.label || ad.position}
            {!ad.active && " · 已停用"}
          </p>
        </>
      )}
      renderForm={() => (
        <>
          <Field label="广告标题" value={editing!.title || editing!.name || ""} onChange={(v) => setEditing({ ...editing!, title: v, name: v })} />
          <div className="space-y-1">
            <Label>广告位置</Label>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={editing!.position || "homepage-top"}
              onChange={(e) => setEditing({ ...editing!, position: e.target.value })}
            >
              {AD_POSITIONS.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </div>
          <Field label="图片地址" value={editing!.imageUrl || ""} onChange={(v) => setEditing({ ...editing!, imageUrl: v })} />
          <Field label="跳转链接" value={editing!.linkUrl || ""} onChange={(v) => setEditing({ ...editing!, linkUrl: v })} />
          <Field label="优先级" type="number" value={String(editing!.priority ?? 0)} onChange={(v) => setEditing({ ...editing!, priority: Number(v) })} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={editing!.active ?? true} onChange={(e) => setEditing({ ...editing!, active: e.target.checked })} />
            启用
          </label>
        </>
      )}
      remove={remove}
    />
  );
}

function NewsTab() {
  const { data: items, mutate } = useSWR<NewsItem[]>("/api/admin/news", fetcher);
  const [editing, setEditing] = useState<Partial<NewsItem> | null>(null);
  const [saving, setSaving] = useState(false);

  const empty: Partial<NewsItem> = {
    titleZh: "",
    slug: "",
    excerptZh: "",
    contentZh: "",
    coverImage: "",
    seoTitle: "",
    seoDescription: "",
    published: false,
  };

  const save = async () => {
    if (!editing?.titleZh) return;
    setSaving(true);
    await fetch("/api/admin/news", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    setSaving(false);
    setEditing(null);
    mutate();
  };

  const remove = async (id: string) => {
    if (!confirm("确定删除此文章？")) return;
    await fetch(`/api/admin/news?id=${id}`, { method: "DELETE" });
    mutate();
  };

  return (
    <EditorLayout
      title="新闻管理"
      newLabel="新增新闻"
      items={items}
      editing={editing}
      setEditing={setEditing}
      empty={empty}
      saving={saving}
      save={save}
      renderItem={(item) => (
        <>
          <p className="font-medium truncate">{item.titleZh}</p>
          <p className="text-xs text-muted-foreground">
            /news/{item.slug}
            {item.published ? <Badge variant="secondary" className="ml-2">已发布</Badge> : <Badge variant="outline" className="ml-2">草稿</Badge>}
          </p>
        </>
      )}
      renderForm={() => (
        <>
          <Field label="标题" value={editing!.titleZh || ""} onChange={(v) => setEditing({ ...editing!, titleZh: v })} />
          <Field label="URL 别名" value={editing!.slug || ""} onChange={(v) => setEditing({ ...editing!, slug: v })} />
          <Field label="摘要" value={editing!.excerptZh || ""} onChange={(v) => setEditing({ ...editing!, excerptZh: v })} />
          <div className="space-y-1">
            <Label>正文</Label>
            <Textarea rows={8} value={editing!.contentZh || ""} onChange={(e) => setEditing({ ...editing!, contentZh: e.target.value })} />
          </div>
          <Field label="封面图" value={editing!.coverImage || ""} onChange={(v) => setEditing({ ...editing!, coverImage: v })} />
          <Field label="SEO 标题" value={editing!.seoTitle || ""} onChange={(v) => setEditing({ ...editing!, seoTitle: v })} />
          <Field label="SEO 描述" value={editing!.seoDescription || ""} onChange={(v) => setEditing({ ...editing!, seoDescription: v })} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={editing!.published ?? false} onChange={(e) => setEditing({ ...editing!, published: e.target.checked })} />
            发布
          </label>
        </>
      )}
      remove={remove}
    />
  );
}

function PredictionsTab() {
  const { data: items, mutate } = useSWR<PredictionItem[]>("/api/admin/predictions", fetcher);
  const [editing, setEditing] = useState<Partial<PredictionItem> | null>(null);
  const [saving, setSaving] = useState(false);

  const empty: Partial<PredictionItem> = {
    titleZh: "",
    slug: "",
    excerptZh: "",
    contentZh: "",
    coverImage: "",
    confidence: 50,
    prediction: "",
    matchId: null,
    published: false,
  };

  const save = async () => {
    if (!editing?.titleZh) return;
    setSaving(true);
    await fetch("/api/admin/predictions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    setSaving(false);
    setEditing(null);
    mutate();
  };

  const remove = async (id: string) => {
    if (!confirm("确定删除此分析？")) return;
    await fetch(`/api/admin/predictions?id=${id}`, { method: "DELETE" });
    mutate();
  };

  return (
    <EditorLayout
      title="赛事分析管理"
      newLabel="新增分析"
      items={items}
      editing={editing}
      setEditing={setEditing}
      empty={empty}
      saving={saving}
      save={save}
      renderItem={(item) => (
        <>
          <p className="font-medium truncate">{item.titleZh}</p>
          <p className="text-xs text-muted-foreground">
            {item.prediction} · {item.confidence}%
            {item.matchId ? ` · 比赛 #${item.matchId}` : ""}
            {item.published ? <Badge variant="secondary" className="ml-2">已发布</Badge> : <Badge variant="outline" className="ml-2">草稿</Badge>}
          </p>
        </>
      )}
      renderForm={() => (
        <>
          <Field label="标题" value={editing!.titleZh || ""} onChange={(v) => setEditing({ ...editing!, titleZh: v })} />
          <Field label="关联比赛 ID" type="number" value={editing!.matchId ? String(editing!.matchId) : ""} onChange={(v) => setEditing({ ...editing!, matchId: v ? Number(v) : null })} />
          <Field label="摘要" value={editing!.excerptZh || ""} onChange={(v) => setEditing({ ...editing!, excerptZh: v })} />
          <div className="space-y-1">
            <Label>正文</Label>
            <Textarea rows={8} value={editing!.contentZh || ""} onChange={(e) => setEditing({ ...editing!, contentZh: e.target.value })} />
          </div>
          <Field label="分析倾向" value={editing!.prediction || ""} onChange={(v) => setEditing({ ...editing!, prediction: v })} />
          <Field label="推荐指数 (%)" type="number" value={String(editing!.confidence ?? 50)} onChange={(v) => setEditing({ ...editing!, confidence: Number(v) })} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={editing!.published ?? false} onChange={(e) => setEditing({ ...editing!, published: e.target.checked })} />
            发布
          </label>
        </>
      )}
      remove={remove}
    />
  );
}

function FeaturedTab() {
  const { data: items, mutate } = useSWR<FeaturedMatchItem[]>("/api/admin/featured-matches", fetcher);
  const [editing, setEditing] = useState<Partial<FeaturedMatchItem> | null>(null);
  const [saving, setSaving] = useState(false);

  const empty: Partial<FeaturedMatchItem> = {
    matchId: 0,
    sortOrder: items?.length ?? 0,
    active: true,
  };

  const save = async () => {
    if (!editing?.matchId) return;
    setSaving(true);
    await fetch("/api/admin/featured-matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    setSaving(false);
    setEditing(null);
    mutate();
  };

  const remove = async (id: string) => {
    if (!confirm("确定删除此推荐比赛？")) return;
    await fetch(`/api/admin/featured-matches?id=${id}`, { method: "DELETE" });
    mutate();
  };

  return (
    <EditorLayout
      title="推荐比赛"
      newLabel="添加比赛"
      items={items}
      editing={editing}
      setEditing={setEditing}
      empty={empty}
      saving={saving}
      save={save}
      renderItem={(item) => (
        <>
          <p className="font-medium">比赛 ID: {item.matchId}</p>
          <p className="text-xs text-muted-foreground">
            排序 {item.sortOrder}
            {item.active ? <Badge variant="secondary" className="ml-2">启用</Badge> : <Badge variant="outline" className="ml-2">停用</Badge>}
          </p>
        </>
      )}
      renderForm={() => (
        <>
          <Field label="比赛 ID" type="number" value={String(editing!.matchId || "")} onChange={(v) => setEditing({ ...editing!, matchId: Number(v) })} />
          <Field label="排序（越小越靠前）" type="number" value={String(editing!.sortOrder ?? 0)} onChange={(v) => setEditing({ ...editing!, sortOrder: Number(v) })} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={editing!.active ?? true} onChange={(e) => setEditing({ ...editing!, active: e.target.checked })} />
            启用
          </label>
        </>
      )}
      remove={remove}
    />
  );
}

function ApiSettingsTab() {
  const { data, mutate } = useSWR("/api/admin/api-settings", fetcher);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState("");

  const refresh = async () => {
    setRefreshing(true);
    setMessage("");
    const res = await fetch("/api/admin/api-settings", { method: "POST" });
    const json = await res.json().catch(() => ({}));
    setRefreshing(false);
    if (res.ok) {
      setMessage(`刷新成功：实时 ${json.liveCount} 场，今日 ${json.todayCount} 场`);
      mutate();
    } else {
      setMessage(json.error || "刷新失败");
    }
  };

  if (!data) return <p className="text-muted-foreground">加载中...</p>;

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader><CardTitle className="text-base">API-Football 状态</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">连接状态</span>
            <Badge variant={data.connected ? "secondary" : "outline"}>
              {data.connected ? "已连接" : "未配置"}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">API Key</span>
            <span>{data.apiKeyMasked}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">赛季</span>
            <span>{data.season}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">今日请求次数</span>
            <span className="font-mono font-semibold">{data.todayRequests}</span>
          </div>
          <Button onClick={refresh} disabled={refreshing || !data.connected}>
            {refreshing ? "刷新中..." : "手动刷新比赛数据"}
          </Button>
          {message && <p className="text-xs text-muted-foreground">{message}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">最近 API 日志</CardTitle></CardHeader>
        <CardContent className="space-y-2 max-h-80 overflow-y-auto">
          {!data.recentLogs?.length && <p className="text-sm text-muted-foreground">暂无日志</p>}
          {data.recentLogs?.map((log: { endpoint: string; statusCode?: number; cached: boolean; createdAt: string }, i: number) => (
            <div key={i} className="text-xs border-b border-border/50 pb-2">
              <span className="font-mono">{log.endpoint}</span>
              <span className="text-muted-foreground ml-2">
                {log.cached ? "缓存" : "请求"} · {log.statusCode ?? "-"}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function EditorLayout<T extends { id: string }>({
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
          <Button size="sm" onClick={() => setEditing(empty)}>{newLabel}</Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {!items?.length && <p className="text-sm text-muted-foreground">暂无数据</p>}
          {items?.map((item) => (
            <div key={item.id} className={ds.adminRow}>
              <div className="min-w-0 flex-1">{renderItem(item)}</div>
              <div className="flex gap-1 shrink-0">
                <Button size="sm" variant="outline" onClick={() => setEditing(item)}>编辑</Button>
                <Button size="sm" variant="destructive" onClick={() => remove(item.id)}>删</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {editing && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{("id" in editing && editing.id) ? "编辑" : "新增"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {renderForm()}
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2 pt-2">
              <Button onClick={save} disabled={saving}>{saving ? "保存中..." : "保存"}</Button>
              <Button variant="outline" onClick={() => setEditing(null)}>取消</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Field({
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
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}
