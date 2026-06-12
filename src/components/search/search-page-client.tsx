"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Player, TeamDetail } from "@/lib/api-football/types";
import { ds } from "@/lib/design";
import type { MockPlayer } from "@/lib/mock/players";
import { translatePlayerName, translateTeamName } from "@/lib/translations/client";

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

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

export function SearchPageClient({ initialQuery, labels }: Props) {
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebouncedValue(query, 350);

  const { data, isLoading } = useSWR<{
    teams: TeamDetail[];
    players: MockPlayer[] | { player: Player }[];
  }>(
    debouncedQuery.length >= 2 ? `/api/search?q=${encodeURIComponent(debouncedQuery)}` : null,
    fetcher,
    { dedupingInterval: 5000 }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={labels.placeholder}
          className="max-w-md rounded-full"
        />
        <Button type="submit" size="icon" className="rounded-full shrink-0">
          <Search className="h-4 w-4" />
        </Button>
      </form>

      {isLoading && debouncedQuery.length >= 2 && (
        <p className="text-muted-foreground">{labels.loading}</p>
      )}

      {data && (
        <div className={ds.stack}>
          {data.teams.length > 0 && (
            <section>
              <h2 className={ds.sectionTitle + " mb-3"}>{labels.teams}</h2>
              <div className={ds.stackSm}>
                {data.teams.map((team) => (
                  <Link
                    key={team.team.id}
                    href={`/team/${team.team.id}`}
                    prefetch
                    className={ds.cardInteractive + " flex items-center gap-3 p-3"}
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
              <div className={ds.stackSm}>
                {data.players.map((entry, index) => {
                  const id =
                    "player" in entry ? entry.player.id : (entry as MockPlayer).player.id;
                  const name =
                    "player" in entry ? entry.player.name : (entry as MockPlayer).player.name;
                  const photo =
                    "player" in entry ? entry.player.photo : (entry as MockPlayer).player.photo;
                  return (
                    <Link
                      key={`${id}-${index}`}
                      href={`/player/${id}`}
                      prefetch
                      className={ds.cardInteractive + " flex items-center gap-3 p-3"}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo}
                        alt=""
                        className="h-8 w-8 rounded-full object-cover"
                      />
                      <span className="font-medium">
                        {translatePlayerName(id, name)}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
          {!data.teams.length && !data.players.length && debouncedQuery.length >= 2 && (
            <p className="text-muted-foreground">{labels.noResults}</p>
          )}
        </div>
      )}
    </div>
  );
}
