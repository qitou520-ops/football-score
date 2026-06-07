"use client";

import { useState } from "react";
import useSWR from "swr";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Player, TeamDetail } from "@/lib/api-football/types";
import { ds } from "@/lib/design";
import type { MockPlayer } from "@/lib/mock/players";
import { translateTeamName } from "@/lib/translations";

interface Props {
  initialQuery: string;
  labels: {
    placeholder: string;
    teams: string;
    players: string;
    noResults: string;
    loading: string;
  };
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function SearchPageClient({ initialQuery, labels }: Props) {
  const [query, setQuery] = useState(initialQuery);

  const { data, isLoading } = useSWR<{
    teams: TeamDetail[];
    players: MockPlayer[] | { player: Player }[];
  }>(
    query.length >= 2 ? `/api/search?q=${encodeURIComponent(query)}` : null,
    fetcher
  );

  return (
    <div>
      <div className="flex gap-2 mb-6">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={labels.placeholder}
          className="max-w-md rounded-full"
        />
        <Button type="button" size="icon" className="rounded-full shrink-0">
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {isLoading && query.length >= 2 && (
        <p className="text-muted-foreground">{labels.loading}</p>
      )}

      {data && (
        <div className={ds.stack}>
          {data.teams.length > 0 && (
            <section>
              <h2 className={ds.sectionTitle + " mb-3"}>{labels.teams}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {data.teams.map((team) => (
                  <Link
                    key={team.team.id}
                    href={`/team/${team.team.id}`}
                    className={ds.listItem}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={team.team.logo} alt="" className="h-8 w-8 object-contain" />
                    <span className="font-medium">
                      {translateTeamName(team.team.id, team.team.name)}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {data.players.length > 0 && (
            <section>
              <h2 className={ds.sectionTitle + " mb-3"}>{labels.players}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {data.players.map((p) => (
                  <Link
                    key={p.player.id}
                    href={`/player/${p.player.id}`}
                    className={ds.listItem}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.player.photo} alt="" className="h-8 w-8 rounded-full object-cover bg-muted" />
                    <span className="font-medium">{p.player.name}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {!data.teams.length && !data.players.length && query.length >= 2 && (
            <p className="text-muted-foreground">{labels.noResults}</p>
          )}
        </div>
      )}
    </div>
  );
}
