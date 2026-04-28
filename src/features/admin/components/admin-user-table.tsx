import { PenSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { AdminUserSummary } from "@/types/admin";

interface AdminUserTableProps {
  users: AdminUserSummary[];
}

function getRoleLabel(role: AdminUserSummary["role"]) {
  return role === "admin" ? "Адмін" : "Курсант";
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AdminUserTable({ users }: AdminUserTableProps) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-ink/8 px-6 py-5">
        <div>
          <h2 className="text-xl font-semibold">Користувачі платформи</h2>
          <p className="mt-1 text-sm">
            Таблиця для перегляду та швидкого переходу до повного редагування
            профілів.
          </p>
        </div>
        <Badge tone="field">{users.length} користувачів</Badge>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-ink/5 text-xs uppercase tracking-[0.16em] text-slate">
            <tr>
              <th className="px-4 py-4 font-semibold">Користувач</th>
              <th className="px-4 py-4 font-semibold">Роль</th>
              <th className="px-4 py-4 font-semibold">Інтереси</th>
              <th className="px-4 py-4 font-semibold">Стан пошти</th>
              <th className="px-4 py-4 font-semibold">Оновлено</th>
              <th className="px-4 py-4 font-semibold">Дія</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id} className="border-t border-ink/8 align-top">
                  <td className="px-4 py-2">
                    <div>
                      <p className="font-semibold text-ink">{user.name}</p>
                      <p className="text-sm text-slate">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <Badge tone={user.role === "admin" ? "field" : "neutral"}>
                      {getRoleLabel(user.role)}
                    </Badge>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex max-w-xs flex-wrap gap-2">
                      {user.interests.length > 0 ? (
                        user.interests
                          .slice(0, 3)
                          .map((interest) => (
                            <Badge key={interest}>{interest}</Badge>
                          ))
                      ) : (
                        <span className="text-sm text-slate">Не вказано</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <Badge tone={user.emailVerified ? "field" : "warning"}>
                      {user.emailVerified ? "Підтверджена" : "Не підтверджена"}
                    </Badge>
                  </td>
                  <td className="px-4 py-2 text-sm text-slate">
                    {formatDate(user.updatedAt)}
                  </td>
                  <td className="px-4 py-2">
                    <Button variant="ghost" asChild>
                      <Link
                        className="inline-flex items-center gap-2"
                        to={`/admin/users/${user.id}/edit`}
                      >
                        <PenSquare className="size-4" />
                        Редагувати
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-6 py-8 text-sm text-slate" colSpan={6}>
                  Користувачів ще не знайдено.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
