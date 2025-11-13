import { Header } from "@/components/Header";
import { OnboardingViewDialog } from "@/components/OnboardingViewDialog";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/services/authService";
import {
  deleteOnboarding,
  getAllOnboardings,
} from "@/services/onboardingService";
import { OnboardingData } from "@/types/onboarding";
import { Eye, RefreshCw, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { scheduleService } from "@/services/scheduleService";
import { ScheduleEntry } from "@/types/schedule";

const HORARIOS_VALIDOS = [
  "09:00",
  "10:00",
  "11:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

const PainelAdmin = () => {
  const navigate = useNavigate();
  // Memoiza o user para evitar mudanças de referência
  const user = useMemo(() => getCurrentUser(), []);
  const userId = useMemo(() => user?.id, [user?.id]);
  const [onboardings, setOnboardings] = useState<OnboardingData[]>([]);
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOnboarding, setSelectedOnboarding] =
    useState<OnboardingData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [onboardingToDelete, setOnboardingToDelete] = useState<string | null>(
    null
  );
  const isLoadingRef = useRef(false);
  const hasLoadedOnceRef = useRef(false);

  const loadOnboardings = useCallback(
    async (showToast = false) => {
      // Evita múltiplas chamadas simultâneas
      if (isLoadingRef.current) {
        return;
      }

      if (!userId) {
        return;
      }

      try {
        isLoadingRef.current = true;
        setLoading(true);
        const data = await getAllOnboardings();
        setOnboardings(data);
        hasLoadedOnceRef.current = true;
        if (showToast) {
          toast.success("Dados atualizados com sucesso");
        }
      } catch (error) {
        console.error("Erro ao carregar onboardings:", error);
        if (showToast) {
          toast.error("Erro ao carregar onboardings");
        }
      } finally {
        setLoading(false);
        isLoadingRef.current = false;
      }
    },
    [userId]
  );

  // Carrega os dados apenas uma vez quando o componente monta
  useEffect(() => {
    if (!user || user.tipo !== "admin") {
      navigate("/login");
      return;
    }

    // Carrega apenas na primeira montagem
    if (!hasLoadedOnceRef.current && userId) {
      loadOnboardings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    setSchedules(scheduleService.listar());
    const unsubscribe = scheduleService.subscribe((entries) =>
      setSchedules(entries)
    );
    return () => {
      unsubscribe();
    };
  }, []);

  const handleDelete = async () => {
    if (!onboardingToDelete) return;

    try {
      await deleteOnboarding(onboardingToDelete);
      toast.success("Onboarding excluído com sucesso");
      // Recarrega os dados após exclusão
      await loadOnboardings();
      setDialogOpen(false);
      setOnboardingToDelete(null);
    } catch (error) {
      toast.error("Erro ao excluir onboarding");
    }
  };

  const handleStatusChange = useCallback(async () => {
    // Recarrega os dados após mudança de status
    await loadOnboardings();
  }, [loadOnboardings]);

  const handleRefresh = () => {
    loadOnboardings(true);
  };

  const openViewDialog = (onboarding: OnboardingData) => {
    setSelectedOnboarding(onboarding);
    setOnboardingToDelete(null);
    setDialogOpen(true);
  };

  const openDeleteDialog = (onboarding: OnboardingData) => {
    setSelectedOnboarding(onboarding);
    setOnboardingToDelete(onboarding.id);
    setDialogOpen(true);
  };

  const schedulesPorData = useMemo(() => {
    const agrupados = new Map<string, ScheduleEntry[]>();

    schedules.forEach((item) => {
      if (!agrupados.has(item.data)) {
        agrupados.set(item.data, []);
      }
      agrupados.get(item.data)!.push(item);
    });

    const datasOrdenadas = Array.from(agrupados.keys()).sort();

    return datasOrdenadas.map((dateKey) => {
      const ocupados = (agrupados.get(dateKey) || []).sort((a, b) =>
        a.horario.localeCompare(b.horario)
      );

      const itens = HORARIOS_VALIDOS.map((horario) => {
        const reservado = ocupados.find((item) => item.horario === horario);
        if (reservado) {
          return {
            horario,
            status: "ocupado" as const,
            clienteNome: reservado.clienteNome,
          };
        }
        return { horario, status: "disponivel" as const };
      });

      return { dateKey, itens };
    });
  }, [schedules]);

  const formatScheduleDateLabel = (dateKey: string) => {
    try {
      const date = new Date(`${dateKey}T00:00:00`);
      const label = date.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      return label.charAt(0).toUpperCase() + label.slice(1);
    } catch {
      return dateKey;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "aprovado":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "em_analise":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "rejeitado":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "aprovado":
        return "Aprovado";
      case "em_analise":
        return "Em Análise";
      case "rejeitado":
        return "Rejeitado";
      default:
        return "Rascunho";
    }
  };

  const formatDate = (date: string | Date | undefined): string => {
    if (!date) return "-";
    try {
      const dateObj = typeof date === "string" ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return "-";
      return dateObj.toLocaleDateString("pt-BR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={user} />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Painel Administrativo
            </h2>
            <p className="text-muted-foreground">
              Gerencie todos os onboardings do sistema
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={loading}
            variant="outline"
            size="sm"
            className="gap-2 self-start sm:self-auto"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Atualizando..." : "Atualizar"}
          </Button>
        </div>

        {onboardings.length === 0 ? (
          <div className="bg-card p-12 rounded-xl border border-border shadow-card text-center">
            <p className="text-muted-foreground">
              Nenhum onboarding encontrado
            </p>
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                      Empresa
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                      Responsável
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                      Data de Envio
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {onboardings.map((onboarding) => (
                    <tr
                      key={onboarding.id}
                      className="hover:bg-secondary/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-foreground">
                            {onboarding.nomeFantasia}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {onboarding.cnpj}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-foreground">
                          {onboarding.representantesLegais[0]?.nome || "-"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-lg border text-xs font-medium ${getStatusColor(
                            onboarding.status
                          )}`}
                        >
                          {getStatusLabel(onboarding.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-foreground">
                        {formatDate(
                          onboarding.criadoEm || onboarding.dataCriacao
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary"
                            onClick={() => openViewDialog(onboarding)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Visualizar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(onboarding)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-12">
          <h3 className="text-2xl font-semibold text-foreground mb-4">
            Agendamentos
          </h3>
          {schedulesPorData.length === 0 ? (
            <div className="bg-card p-8 rounded-xl border border-border shadow-card text-center">
              <p className="text-muted-foreground">
                Nenhum agendamento registrado até o momento.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {schedulesPorData.map(({ dateKey, itens }) => (
                <div
                  key={dateKey}
                  className="bg-card rounded-xl border border-border shadow-card overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-border bg-secondary/50">
                    <p className="text-sm font-semibold text-foreground capitalize">
                      {formatScheduleDateLabel(dateKey)}
                    </p>
                  </div>
                  <div className="divide-y divide-border">
                    {itens.map((item) => (
                      <div
                        key={`${dateKey}-${item.horario}`}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-3 gap-1"
                      >
                        <span className="text-sm font-medium text-foreground">
                          {item.horario}
                        </span>
                        <span
                          className={`text-sm ${
                            item.status === "ocupado"
                              ? "text-muted-foreground"
                              : "text-green-500"
                          }`}
                        >
                          {item.status === "ocupado"
                            ? item.clienteNome || "Cliente não identificado"
                            : "Disponível"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <OnboardingViewDialog
          onboarding={selectedOnboarding}
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setSelectedOnboarding(null);
              setOnboardingToDelete(null);
            }
          }}
          onDelete={onboardingToDelete ? handleDelete : undefined}
          onStatusChange={handleStatusChange}
        />
      </main>
    </div>
  );
};

export default PainelAdmin;
