"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Boxes,
  ClipboardList,
  Euro,
  FolderTree,
  Package,
  ShoppingBag,
  Store,
  TrendingUp,
  Users,
} from "lucide-react";

interface MonthlyRevenue {
  month: number;
  monthName: string;
  revenue: number;
}

interface DashboardData {
  orders: number;
  customers: number;
  products: number;
  revenue: number;
  monthlyRevenue: MonthlyRevenue[];
  year: number;
}

interface DashboardErrorResponse {
  error?: string;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function AdminDashboard(): React.ReactElement {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [selectedYearRevenue, setSelectedYearRevenue] = useState<
    MonthlyRevenue[]
  >([]);
  const [yearLoading, setYearLoading] = useState<boolean>(false);

  useEffect(() => {
    async function loadDashboard(): Promise<void> {
      try {
        setLoading(true);

        const response = await fetch("/api/admin/dashboard", {
          cache: "no-store",
        });

        const result = (await response.json()) as
          | DashboardData
          | DashboardErrorResponse;

        if (!response.ok) {
          throw new Error(
            "error" in result && result.error
              ? result.error
              : "Failed to load dashboard"
          );
        }

        if (!("monthlyRevenue" in result)) {
          throw new Error("Réponse invalide du serveur.");
        }

        setData(result);
        setSelectedYear(result.year);
        setSelectedYearRevenue(result.monthlyRevenue);
      } catch (error) {
        console.error("DASHBOARD ERROR:", error);
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  async function changeYear(year: number): Promise<void> {
    if (year === selectedYear || yearLoading) {
      return;
    }

    try {
      setYearLoading(true);
      setSelectedYear(year);

      const response = await fetch(
        `/api/admin/dashboard?year=${year}`,
        {
          cache: "no-store",
        }
      );

      const result = (await response.json()) as
        | DashboardData
        | DashboardErrorResponse;

      if (!response.ok) {
        throw new Error(
          "error" in result && result.error
            ? result.error
            : "Failed to load revenue"
        );
      }

      if (!("monthlyRevenue" in result)) {
        throw new Error("Réponse invalide du serveur.");
      }

      setSelectedYearRevenue(result.monthlyRevenue);
    } catch (error) {
      console.error("YEAR REVENUE ERROR:", error);
    } finally {
      setYearLoading(false);
    }
  }

  const maxRevenue = Math.max(
    ...selectedYearRevenue.map((item) => item.revenue),
    1
  );

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#7C8B73]/20 border-t-[#7C8B73]" />

          <p className="mt-4 text-sm text-gray-500">
            Chargement du tableau de bord...
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
        <p className="text-gray-600">
          Impossible de charger les données du tableau de bord.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.15em] text-[#7C8B73]">
            <BarChart3 size={17} />
            Dashboard
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-[#394438] md:text-5xl">
            Administration
          </h1>

          <p className="mt-3 max-w-xl text-gray-600">
            Suivez les performances de Fairy&apos;s, vos commandes, vos
            clients, vos produits et votre chiffre d&apos;affaires.
          </p>
        </div>

        <div className="rounded-2xl bg-white px-5 py-4 shadow-sm">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Année du graphique
          </p>

          <select
            value={selectedYear}
            disabled={yearLoading}
            onChange={(event) => {
              void changeYear(Number(event.target.value));
            }}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 font-semibold text-[#394438] outline-none transition focus:border-[#7C8B73] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value={2026}>2026</option>
            <option value={2025}>2025</option>
            <option value={2024}>2024</option>
            <option value={2023}>2023</option>
          </select>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <Link
          href="/admin/orders"
          className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#7C8B73]/10 transition group-hover:scale-125" />

          <div className="relative">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7C8B73]/10 text-[#7C8B73]">
                <ClipboardList size={23} />
              </div>

              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Commandes
              </span>
            </div>

            <p className="text-4xl font-bold text-[#394438]">
              {data.orders}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Toutes les commandes
            </p>
          </div>
        </Link>

        <div className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#D7A7A0]/15 transition group-hover:scale-125" />

          <div className="relative">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D7A7A0]/15 text-[#A66E66]">
                <Users size={23} />
              </div>

              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Clients
              </span>
            </div>

            <p className="text-4xl font-bold text-[#394438]">
              {data.customers}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Clients enregistrés
            </p>
          </div>
        </div>

        <Link
          href="/admin/products"
          className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#C7B89A]/15 transition group-hover:scale-125" />

          <div className="relative">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#C7B89A]/15 text-[#8A7651]">
                <Package size={23} />
              </div>

              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Produits
              </span>
            </div>

            <p className="text-4xl font-bold text-[#394438]">
              {data.products}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Produits disponibles
            </p>
          </div>
        </Link>

        <div className="group relative overflow-hidden rounded-3xl bg-[#394438] p-6 text-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/5 transition group-hover:scale-125" />

          <div className="relative">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                <Euro size={23} />
              </div>

              <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
                Chiffre d&apos;affaires
              </span>
            </div>

            <p className="text-4xl font-bold">
              {formatCurrency(data.revenue)}{" "}
              <span className="text-lg font-medium text-white/60">
                TND
              </span>
            </p>

            <p className="mt-2 text-sm text-white/60">
              Commandes livrées uniquement
            </p>
          </div>
        </div>
      </div>

      <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm md:p-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp
                size={20}
                className="text-[#7C8B73]"
              />

              <h2 className="text-2xl font-bold text-[#394438]">
                Chiffre d&apos;affaires
              </h2>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              Chiffre d&apos;affaires mensuel basé uniquement sur les
              commandes livrées.
            </p>
          </div>

          <div className="rounded-full bg-[#7C8B73]/10 px-4 py-2 text-sm font-semibold text-[#7C8B73]">
            {selectedYear}
          </div>
        </div>

        <div className="flex h-[340px] items-end gap-2 overflow-x-auto border-b border-gray-100 pb-0 sm:gap-4">
          {selectedYearRevenue.map((month) => {
            const height =
              month.revenue === 0
                ? 4
                : Math.max(
                    (month.revenue / maxRevenue) * 100,
                    5
                  );

            return (
              <div
                key={month.month}
                className="flex h-full min-w-[45px] flex-1 flex-col justify-end"
              >
                <div className="mb-2 text-center text-xs font-semibold text-gray-500">
                  {month.revenue > 0
                    ? formatCurrency(month.revenue)
                    : ""}
                </div>

                <div
                  className="group relative w-full rounded-t-xl bg-[#7C8B73] transition-all duration-500 hover:bg-[#66745F]"
                  style={{
                    height: `${height}%`,
                  }}
                  title={`${month.monthName}: ${formatCurrency(
                    month.revenue
                  )} TND`}
                />

                <div className="mt-3 text-center text-xs font-medium text-gray-400">
                  {month.monthName}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-5 text-2xl font-bold text-[#394438]">
          Gestion rapide
        </h2>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/admin/products"
            className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7C8B73]/10 text-[#7C8B73]">
              <ShoppingBag size={21} />
            </div>

            <div>
              <p className="font-semibold text-[#394438]">
                Produits
              </p>

              <p className="text-sm text-gray-500">
                Gérer le catalogue
              </p>
            </div>
          </Link>

          <Link
            href="/admin/categories"
            className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#D7A7A0]/15 text-[#A66E66]">
              <FolderTree size={21} />
            </div>

            <div>
              <p className="font-semibold text-[#394438]">
                Catégories
              </p>

              <p className="text-sm text-gray-500">
                Organiser les produits
              </p>
            </div>
          </Link>

          <Link
            href="/admin/brands"
            className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#C7B89A]/15 text-[#8A7651]">
              <Store size={21} />
            </div>

            <div>
              <p className="font-semibold text-[#394438]">
                Marques
              </p>

              <p className="text-sm text-gray-500">
                Gérer les marques
              </p>
            </div>
          </Link>

          <Link
            href="/admin/orders"
            className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#394438]/10 text-[#394438]">
              <Boxes size={21} />
            </div>

            <div>
              <p className="font-semibold text-[#394438]">
                Commandes
              </p>

              <p className="text-sm text-gray-500">
                Suivre les commandes
              </p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}