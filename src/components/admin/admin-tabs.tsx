"use client";

import { useState } from "react";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  AD_POSITIONS,
  type AdItem,
  type AffiliateLinkItem,
  type FeaturedMatchItem,
  type NewsItem,
  type PredictionItem,
  type SiteSettings,
  slugify,
} from "@/lib/cms/types";
import { adminDelete, adminFetch, adminSave } from "@/lib/admin/api-client";
import {
  EditorLayout,
  Field,
  MatchPicker,
  StatCard,
  TextAreaField,
} from "./admin-editor";

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("Unauthorized");
    return r.json();
  });

type FeaturedWithPreview = FeaturedMatchItem & {
  preview?: string | null;
  kickoff?: string | null;
};

export function OverviewTab() {
  const { data: stats } = useSWR("/api/admin/stats", fetcher, { refreshInterval: 30000 });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Badge variant={stats?.databaseMode ? "secondary" : "outline"}>
          {stats?.databaseMode ? "MySQL 数据库模式" : "文件模式 (cms.json)"}
        </Badge>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard label="今日比赛" value={stats?.todayMatches ?? "-"} />
        <StatCard label="实时比赛" value={stats?.liveMatches ?? "-"} />
        <StatCard label="API 请求（今日）" value={stats?.apiRequests ?? "-"} />
        <StatCard label="聊天消息" value={stats?.chatMessages ?? "-"} />
        <StatCard label="广告" value={stats?.ads ?? "-"} sub={`${stats?.activeAds ?? 0} 启用`} />
        <StatCard label="新闻" value={stats?.news ?? "-"} sub={`${stats?.publishedNews ?? 0} 已发布`} />
        <StatCard
          label="赛事分析"
          value={stats?.predictions ?? "-"}
          sub={`${stats?.publishedPredictions ?? 0} 已发布`}
        />
        <StatCard
          label="推荐比赛"
          value={stats?.featuredMatches ?? "-"}
          sub={`${stats?.activeFeaturedMatches ?? 0} 启用`}
        />
      </div>
    </div>
  );
}

export function SettingsTab() {
  const { data, mutate } = useSWR<SiteSettings & { databaseMode?: boolean }>(
    "/api/admin/settings",
    fetcher
  );
  const [form, setForm] = useState<Partial<SiteSettings>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [pwd, setPwd] = useState({ current: "", next: "" });
  const [pwdMsg, setPwdMsg] = useState("");

  const settings = { ...data, ...form } as SiteSettings;

  const saveSettings = async () => {
    setSaving(true);
    setError("");
    setOk("");
    try {
      await adminSave("/api/admin/settings", {
        siteName: settings.siteName,
        siteDescription: settings.siteDescription,
        telegramUrl: settings.telegramUrl,
        partnerUrl: settings.partnerUrl,
      });
      setOk("设置已保存，刷新前台即可生效");
      mutate();
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    setPwdMsg("");
    try {
      await adminSave("/api/admin/password", {
        currentPassword: pwd.current,
        newPassword: pwd.next,
      });
      setPwdMsg("密码已修改");
      setPwd({ current: "", next: "" });
    } catch (e) {
      setPwdMsg(e instanceof Error ? e.message : "修改失败");
    }
  };

  if (!data) return <p className="text-muted-foreground">加载中...</p>;

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">站点设置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Field
            label="网站名称"
            value={settings.siteName || ""}
            onChange={(v) => setForm((f) => ({ ...f, siteName: v }))}
          />
          <TextAreaField
            label="网站描述"
            value={settings.siteDescription || ""}
            onChange={(v) => setForm((f) => ({ ...f, siteDescription: v }))}
            rows={3}
          />
          <Field
            label="合作推广链接"
            value={settings.partnerUrl || ""}
            onChange={(v) => setForm((f) => ({ ...f, partnerUrl: v }))}
            placeholder="https://hga050h.com"
          />
          <Field
            label="Telegram 链接（可选）"
            value={settings.telegramUrl || ""}
            onChange={(v) => setForm((f) => ({ ...f, telegramUrl: v }))}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          {ok && <p className="text-sm text-green-600">{ok}</p>}
          <Button onClick={saveSettings} disabled={saving}>
            {saving ? "保存中..." : "保存设置"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">修改密码</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.databaseMode ? (
            <>
              <Field
                label="当前密码"
                type="password"
                value={pwd.current}
                onChange={(v) => setPwd((p) => ({ ...p, current: v }))}
              />
              <Field
                label="新密码"
                type="password"
                value={pwd.next}
                onChange={(v) => setPwd((p) => ({ ...p, next: v }))}
              />
              <Button onClick={changePassword}>修改密码</Button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              当前为文件模式，请修改环境变量 <code className="text-xs">ADMIN_PASSWORD</code>{" "}
              后重启服务。
            </p>
          )}
          {pwdMsg && <p className="text-sm text-muted-foreground">{pwdMsg}</p>}
        </CardContent>
      </Card>
    </div>
  );
}

export function AdsTab() {
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
    if (!editing?.name && !editing?.title) return;
    setSaving(true);
    setError("");
    try {
      await adminSave("/api/admin/ads", editing);
      setEditing(null);
      mutate();
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("确定删除此广告？")) return;
    await adminDelete(`/api/admin/ads?id=${id}`);
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
            {ad.htmlCode ? " · HTML" : ""}
            {!ad.active && " · 已停用"}
          </p>
        </>
      )}
      renderForm={() => (
        <>
          <Field
            label="广告标题"
            value={editing!.title || editing!.name || ""}
            onChange={(v) => setEditing({ ...editing!, title: v, name: v })}
          />
          <div className="space-y-1">
            <Label>广告位置</Label>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={editing!.position || "homepage-top"}
              onChange={(e) => setEditing({ ...editing!, position: e.target.value })}
            >
              {AD_POSITIONS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
              <option value="homepage-banner">首页横幅（兼容）</option>
              <option value="sidebar-top">侧边栏顶部（兼容）</option>
              <option value="mobile-banner">手机横幅（兼容）</option>
            </select>
          </div>
          <TextAreaField
            label="自定义 HTML"
            value={editing!.htmlCode || ""}
            onChange={(v) => setEditing({ ...editing!, htmlCode: v })}
            rows={8}
            hint="支持 HTML 广告；填写后优先于图片展示。脚本标签会被自动过滤。"
          />
          <Field
            label="图片地址"
            value={editing!.imageUrl || ""}
            onChange={(v) => setEditing({ ...editing!, imageUrl: v })}
          />
          <Field
            label="跳转链接"
            value={editing!.linkUrl || ""}
            onChange={(v) => setEditing({ ...editing!, linkUrl: v })}
          />
          <Field
            label="优先级"
            type="number"
            value={String(editing!.priority ?? 0)}
            onChange={(v) => setEditing({ ...editing!, priority: Number(v) })}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={editing!.active ?? true}
              onChange={(e) => setEditing({ ...editing!, active: e.target.checked })}
            />
            启用
          </label>
        </>
      )}
      remove={remove}
    />
  );
}

function useCrudSave<T extends { id: string }>(
  url: string,
  mutate: () => void,
  setEditing: (v: null) => void
) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async (editing: Partial<T>, validate?: () => boolean) => {
    if (validate && !validate()) return;
    setSaving(true);
    setError("");
    try {
      await adminSave(url, editing);
      setEditing(null);
      mutate();
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  return { saving, error, save, setError };
}

export function NewsTab() {
  const { data: items, mutate } = useSWR<NewsItem[]>("/api/admin/news", fetcher);
  const [editing, setEditing] = useState<Partial<NewsItem> | null>(null);
  const { saving, error, save } = useCrudSave<NewsItem>("/api/admin/news", mutate, setEditing);

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

  const remove = async (id: string) => {
    if (!confirm("确定删除此文章？")) return;
    await adminDelete(`/api/admin/news?id=${id}`);
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
      save={() => void save(editing!, () => Boolean(editing?.titleZh))}
      error={error}
      renderItem={(item) => (
        <>
          <p className="font-medium truncate">{item.titleZh}</p>
          <p className="text-xs text-muted-foreground">
            /news/{item.slug}
            {item.published ? (
              <Badge variant="secondary" className="ml-2">
                已发布
              </Badge>
            ) : (
              <Badge variant="outline" className="ml-2">
                草稿
              </Badge>
            )}
          </p>
        </>
      )}
      renderForm={() => (
        <>
          <Field
            label="标题"
            value={editing!.titleZh || ""}
            onChange={(v) =>
              setEditing({
                ...editing!,
                titleZh: v,
                slug: editing!.slug || slugify(v),
              })
            }
          />
          <Field
            label="URL 别名"
            value={editing!.slug || ""}
            onChange={(v) => setEditing({ ...editing!, slug: v })}
          />
          <Field
            label="摘要"
            value={editing!.excerptZh || ""}
            onChange={(v) => setEditing({ ...editing!, excerptZh: v })}
          />
          <TextAreaField
            label="正文"
            value={editing!.contentZh || ""}
            onChange={(v) => setEditing({ ...editing!, contentZh: v })}
            rows={8}
          />
          <Field
            label="封面图"
            value={editing!.coverImage || ""}
            onChange={(v) => setEditing({ ...editing!, coverImage: v })}
          />
          <Field
            label="SEO 标题"
            value={editing!.seoTitle || ""}
            onChange={(v) => setEditing({ ...editing!, seoTitle: v })}
          />
          <Field
            label="SEO 描述"
            value={editing!.seoDescription || ""}
            onChange={(v) => setEditing({ ...editing!, seoDescription: v })}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={editing!.published ?? false}
              onChange={(e) => setEditing({ ...editing!, published: e.target.checked })}
            />
            发布
          </label>
        </>
      )}
      remove={remove}
    />
  );
}

export function PredictionsTab() {
  const { data: items, mutate } = useSWR<PredictionItem[]>("/api/admin/predictions", fetcher);
  const [editing, setEditing] = useState<Partial<PredictionItem> | null>(null);
  const { saving, error, save } = useCrudSave<PredictionItem>(
    "/api/admin/predictions",
    mutate,
    setEditing
  );

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

  const remove = async (id: string) => {
    if (!confirm("确定删除此分析？")) return;
    await adminDelete(`/api/admin/predictions?id=${id}`);
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
      save={() => save(editing!, () => Boolean(editing?.titleZh))}
      error={error}
      renderItem={(item) => (
        <>
          <p className="font-medium truncate">{item.titleZh}</p>
          <p className="text-xs text-muted-foreground">
            {item.prediction} · {item.confidence}%
            {item.matchId ? ` · 比赛 #${item.matchId}` : ""}
            {item.published ? (
              <Badge variant="secondary" className="ml-2">
                已发布
              </Badge>
            ) : (
              <Badge variant="outline" className="ml-2">
                草稿
              </Badge>
            )}
          </p>
        </>
      )}
      renderForm={() => (
        <>
          <Field
            label="标题"
            value={editing!.titleZh || ""}
            onChange={(v) =>
              setEditing({
                ...editing!,
                titleZh: v,
                slug: editing!.slug || slugify(v) || `pred-${Date.now()}`,
              })
            }
          />
          <Field
            label="URL 别名"
            value={editing!.slug || ""}
            onChange={(v) => setEditing({ ...editing!, slug: v })}
          />
          <MatchPicker
            value={editing!.matchId ?? null}
            onChange={(id) => setEditing({ ...editing!, matchId: id })}
          />
          <Field
            label="关联比赛 ID"
            type="number"
            value={editing!.matchId ? String(editing!.matchId) : ""}
            onChange={(v) => setEditing({ ...editing!, matchId: v ? Number(v) : null })}
          />
          <Field
            label="摘要"
            value={editing!.excerptZh || ""}
            onChange={(v) => setEditing({ ...editing!, excerptZh: v })}
          />
          <TextAreaField
            label="正文"
            value={editing!.contentZh || ""}
            onChange={(v) => setEditing({ ...editing!, contentZh: v })}
            rows={8}
          />
          <Field
            label="封面图"
            value={editing!.coverImage || ""}
            onChange={(v) => setEditing({ ...editing!, coverImage: v })}
          />
          <Field
            label="分析倾向"
            value={editing!.prediction || ""}
            onChange={(v) => setEditing({ ...editing!, prediction: v })}
          />
          <Field
            label="推荐指数 (%)"
            type="number"
            value={String(editing!.confidence ?? 50)}
            onChange={(v) => setEditing({ ...editing!, confidence: Number(v) })}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={editing!.published ?? false}
              onChange={(e) => setEditing({ ...editing!, published: e.target.checked })}
            />
            发布
          </label>
        </>
      )}
      remove={remove}
    />
  );
}

export function FeaturedTab() {
  const { data: items, mutate } = useSWR<FeaturedWithPreview[]>(
    "/api/admin/featured-matches",
    fetcher
  );
  const [editing, setEditing] = useState<Partial<FeaturedMatchItem> | null>(null);
  const { saving, error, save } = useCrudSave<FeaturedMatchItem>(
    "/api/admin/featured-matches",
    mutate,
    setEditing
  );

  const empty: Partial<FeaturedMatchItem> = {
    matchId: 0,
    sortOrder: items?.length ?? 0,
    active: true,
  };

  const remove = async (id: string) => {
    if (!confirm("确定删除此推荐比赛？")) return;
    await adminDelete(`/api/admin/featured-matches?id=${id}`);
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
      save={() => save(editing!, () => Boolean(editing?.matchId))}
      error={error}
      renderItem={(item: FeaturedWithPreview) => (
        <>
          <p className="font-medium truncate">
            {item.preview || `比赛 #${item.matchId}`}
          </p>
          <p className="text-xs text-muted-foreground">
            ID {item.matchId} · 排序 {item.sortOrder}
            {item.kickoff ? ` · ${new Date(item.kickoff).toLocaleString("zh-CN")}` : ""}
            {item.active ? (
              <Badge variant="secondary" className="ml-2">
                启用
              </Badge>
            ) : (
              <Badge variant="outline" className="ml-2">
                停用
              </Badge>
            )}
          </p>
        </>
      )}
      renderForm={() => (
        <>
          <MatchPicker
            value={editing!.matchId || null}
            onChange={(id) => setEditing({ ...editing!, matchId: id ?? 0 })}
          />
          <Field
            label="比赛 ID"
            type="number"
            value={String(editing!.matchId || "")}
            onChange={(v) => setEditing({ ...editing!, matchId: Number(v) })}
          />
          <Field
            label="排序（越小越靠前）"
            type="number"
            value={String(editing!.sortOrder ?? 0)}
            onChange={(v) => setEditing({ ...editing!, sortOrder: Number(v) })}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={editing!.active ?? true}
              onChange={(e) => setEditing({ ...editing!, active: e.target.checked })}
            />
            启用
          </label>
        </>
      )}
      remove={remove}
    />
  );
}

export function ChatTab() {
  const { data, mutate } = useSWR<{ messages: Array<{ id: string; matchId: number; nickname: string; message: string; createdAt: string }> }>(
    "/api/admin/chat?limit=80",
    fetcher,
    { refreshInterval: 15000 }
  );

  const remove = async (id: string) => {
    await adminDelete(`/api/admin/chat?id=${id}`);
    mutate();
  };

  const clearMatch = async (matchId: number) => {
    if (!confirm(`清空比赛 #${matchId} 的全部聊天？`)) return;
    await adminDelete(`/api/admin/chat?matchId=${matchId}`);
    mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">聊天审核</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 max-h-[70vh] overflow-y-auto">
        {!data?.messages?.length && (
          <p className="text-sm text-muted-foreground">暂无聊天消息</p>
        )}
        {data?.messages?.map((m) => (
          <div key={m.id} className="flex gap-2 items-start border-b border-border/50 pb-2 text-sm">
            <div className="flex-1 min-w-0">
              <p className="font-medium">
                比赛 #{m.matchId} · {m.nickname}
              </p>
              <p className="text-muted-foreground break-words">{m.message}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date(m.createdAt).toLocaleString("zh-CN")}
              </p>
            </div>
            <div className="flex flex-col gap-1 shrink-0">
              <Button size="sm" variant="outline" onClick={() => remove(m.id)}>
                删除
              </Button>
              <Button size="sm" variant="ghost" onClick={() => clearMatch(m.matchId)}>
                清空本场
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function AffiliateTab() {
  const { data: items, mutate } = useSWR<AffiliateLinkItem[]>("/api/admin/affiliate", fetcher);
  const [editing, setEditing] = useState<Partial<AffiliateLinkItem> | null>(null);
  const { saving, error, save } = useCrudSave<AffiliateLinkItem>(
    "/api/admin/affiliate",
    mutate,
    setEditing
  );

  const empty: Partial<AffiliateLinkItem> = {
    name: "",
    slug: "",
    destination: "",
    partner: "partner",
    active: true,
    clicks: 0,
  };

  const remove = async (id: string) => {
    if (!confirm("确定删除此推广链接？")) return;
    await adminDelete(`/api/admin/affiliate?id=${id}`);
    mutate();
  };

  return (
    <EditorLayout
      title="推广链接"
      newLabel="新增链接"
      items={items}
      editing={editing}
      setEditing={setEditing}
      empty={empty}
      saving={saving}
      save={() =>
        save(editing!, () => Boolean(editing?.name && editing?.slug && editing?.destination))
      }
      error={error}
      renderItem={(item) => (
        <>
          <p className="font-medium truncate">{item.name}</p>
          <p className="text-xs text-muted-foreground">
            /go/{item.slug} · 点击 {item.clicks}
            {!item.active && " · 已停用"}
          </p>
        </>
      )}
      renderForm={() => (
        <>
          <Field
            label="名称"
            value={editing!.name || ""}
            onChange={(v) =>
              setEditing({
                ...editing!,
                name: v,
                slug: editing!.slug || slugify(v).replace(/[^\w-]/g, ""),
              })
            }
          />
          <Field
            label="Slug（访问 /go/slug）"
            value={editing!.slug || ""}
            onChange={(v) => setEditing({ ...editing!, slug: v })}
          />
          <Field
            label="目标 URL"
            value={editing!.destination || ""}
            onChange={(v) => setEditing({ ...editing!, destination: v })}
          />
          <Field
            label="合作方"
            value={editing!.partner || ""}
            onChange={(v) => setEditing({ ...editing!, partner: v })}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={editing!.active ?? true}
              onChange={(e) => setEditing({ ...editing!, active: e.target.checked })}
            />
            启用
          </label>
        </>
      )}
      remove={remove}
    />
  );
}

export function ApiSettingsTab() {
  const { data, mutate } = useSWR("/api/admin/api-settings", fetcher);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState("");

  const refresh = async () => {
    setRefreshing(true);
    setMessage("");
    try {
      const json = await adminFetch<{ liveCount: number; todayCount: number }>(
        "/api/admin/api-settings",
        { method: "POST" }
      );
      setMessage(`刷新成功：实时 ${json.liveCount} 场，今日 ${json.todayCount} 场`);
      mutate();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "刷新失败");
    } finally {
      setRefreshing(false);
    }
  };

  if (!data) return <p className="text-muted-foreground">加载中...</p>;

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">API-Football 状态</CardTitle>
        </CardHeader>
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
        <CardHeader>
          <CardTitle className="text-base">最近 API 日志</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 max-h-80 overflow-y-auto">
          {!data.recentLogs?.length && (
            <p className="text-sm text-muted-foreground">暂无日志</p>
          )}
          {data.recentLogs?.map(
            (
              log: {
                endpoint: string;
                statusCode?: number;
                cached: boolean;
                createdAt: string;
              },
              i: number
            ) => (
              <div key={i} className="text-xs border-b border-border/50 pb-2">
                <span className="font-mono">{log.endpoint}</span>
                <span className="text-muted-foreground ml-2">
                  {log.cached ? "缓存" : "请求"} · {log.statusCode ?? "-"}
                </span>
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}
