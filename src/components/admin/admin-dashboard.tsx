"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";
import { ds } from "@/lib/design";
import {
  OverviewTab,
  SettingsTab,
  AdsTab,
  NewsTab,
  PredictionsTab,
  FeaturedTab,
  ChatTab,
  AffiliateTab,
  ApiSettingsTab,
} from "./admin-tabs";

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("Unauthorized");
    return r.json();
  });

const ADMIN_TABS = [
  { id: "overview", label: "概览" },
  { id: "settings", label: "系统设置" },
  { id: "ads", label: "广告管理" },
  { id: "news", label: "新闻管理" },
  { id: "predictions", label: "赛事分析" },
  { id: "featured", label: "推荐比赛" },
  { id: "chat", label: "聊天审核" },
  { id: "affiliate", label: "推广链接" },
  { id: "api", label: "API 设置" },
];

export function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState("overview");
  const { data: me } = useSWR<{ email: string; databaseMode?: boolean }>("/api/admin/me", fetcher);

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className={ds.pageTitle}>管理后台</h1>
            {me?.email && (
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                {me.email}
                <Badge variant="outline" className="text-[10px]">
                  {me.databaseMode ? "数据库" : "文件"}
                </Badge>
              </p>
            )}
          </div>
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
        {tab === "settings" && <SettingsTab />}
        {tab === "ads" && <AdsTab />}
        {tab === "news" && <NewsTab />}
        {tab === "predictions" && <PredictionsTab />}
        {tab === "featured" && <FeaturedTab />}
        {tab === "chat" && <ChatTab />}
        {tab === "affiliate" && <AffiliateTab />}
        {tab === "api" && <ApiSettingsTab />}
      </main>
    </div>
  );
}
