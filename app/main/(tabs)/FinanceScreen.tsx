// app/(tabs)/finance.tsx  (o el nombre que uses para la pestaña)
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";

type Period = "daily" | "weekly" | "monthly";

interface Transaction {
  id: number;
  user_id: string;
  amount: number;
  type: "income" | "expense";
  category: string | null;
  note: string | null;
  created_at: string;
}

const screenWidth = Dimensions.get("window").width;

export default function FinanceScreen() {
  const { session } = useAuth();
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("monthly");

  const [totalBalance, setTotalBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);

  useEffect(() => {
    if (!session?.user) return;

    fetchTransactions(); // carga inicial

    // ⭐ Suscripción a cambios en la tabla
    const channel = supabase
      .channel("transactions-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "transactions",
          filter: `user_id=eq.${session.user.id}`,
        },
        (payload) => {
          console.log("Cambio detectado:", payload);
          fetchTransactions(); // 🔥 refresca automáticamente
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);


  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error loading transactions:", error.message);
        return;
      }

      const tx = (data || []) as Transaction[];

      // Cálculos globales
      let income = 0;
      let expenses = 0;
      tx.forEach((t) => {
        const amount = Number(t.amount);
        if (t.type === "income") income += amount;
        else expenses += amount;
      });

      setTotalIncome(income);
      setTotalExpenses(expenses);
      setTotalBalance(income - expenses);
      setTransactions(tx);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar por periodo (daily / weekly / monthly)
  const getFilteredTransactions = (): Transaction[] => {
    const now = new Date();
    let fromDate = new Date();

    if (period === "daily") {
      fromDate.setDate(now.getDate() - 1);
    } else if (period === "weekly") {
      fromDate.setDate(now.getDate() - 7);
    } else {
      fromDate.setDate(now.getDate() - 30);
    }

    return transactions.filter(
      (t) => new Date(t.created_at).getTime() >= fromDate.getTime()
    );
  };

  const buildChartData = () => {
    const filtered = getFilteredTransactions();
    if (filtered.length === 0) {
      return {
        labels: ["Sin datos"],
        data: [0],
      };
    }

    // Agrupar por día y calcular balance acumulado
    const sorted = [...filtered].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    const labels: string[] = [];
    const data: number[] = [];

    let running = 0;
    sorted.forEach((t) => {
      const amount = Number(t.amount);
      if (t.type === "income") running += amount;
      else running -= amount;

      const date = new Date(t.created_at);
      const label = `${date.getDate()}/${date.getMonth() + 1}`;
      labels.push(label);
      data.push(running);
    });

    return { labels, data };
  };

  const chart = buildChartData();

  const handleAddMovement = () => {
    router.push("/main/addMovement"); // ajusta la ruta si usas otro nombre
  };

  const periodButtonStyle = (p: Period) => [
    styles.periodButton,
    period === p && styles.periodButtonActive,
  ];

  const periodTextStyle = (p: Period) => [
    styles.periodText,
    period === p && styles.periodTextActive,
  ];

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#CFF008" />
        <Text style={{ color: "#ffffff", marginTop: 10 }}>
          Loading your finances...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      {/* Balance card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balanceValue}>
          $
          {totalBalance.toLocaleString("es-CO", {
            maximumFractionDigits: 0,
          })}
        </Text>

        <View style={styles.reRow}>
          <View style={styles.reCol}>
            <Text style={styles.reLabel}>Revenue</Text>
            <Text style={[styles.reValue, { color: "#51FF80" }]}>
              +$
              {totalIncome.toLocaleString("es-CO", {
                maximumFractionDigits: 0,
              })}
            </Text>
          </View>
          <View style={styles.reCol}>
            <Text style={styles.reLabel}>Expenses</Text>
            <Text style={[styles.reValue, { color: "#FF4D6A" }]}>
              -$
              {totalExpenses.toLocaleString("es-CO", {
                maximumFractionDigits: 0,
              })}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.aiButton}
          onPress={() =>
            router.push({
              pathname: "/main/(tabs)/chatbot",
              params: {
                fromFinance: "true",
                income: totalIncome.toString(),
                expenses: totalExpenses.toString(),
                balance: totalBalance.toString(),
              },
            })
          }
        >
          <Text style={styles.aiButtonText}>
            IA suggestion based on your behavior
          </Text>
        </TouchableOpacity>
      </View>

      {/* Period selector */}
      <View style={styles.periodRow}>
        <TouchableOpacity
          style={periodButtonStyle("daily")}
          onPress={() => setPeriod("daily")}
        >
          <Text style={periodTextStyle("daily")}>Daily</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={periodButtonStyle("weekly")}
          onPress={() => setPeriod("weekly")}
        >
          <Text style={periodTextStyle("weekly")}>Weekly</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={periodButtonStyle("monthly")}
          onPress={() => setPeriod("monthly")}
        >
          <Text style={periodTextStyle("monthly")}>Monthly</Text>
        </TouchableOpacity>
      </View>

      {/* Chart */}
      <View style={styles.chartCard}>
        <Text style={styles.sectionTitle}>Balance evolution</Text>
        <LineChart
          data={{
            labels: chart.labels,
            datasets: [
              {
                data: chart.data,
                strokeWidth: 2,
              },
            ],
          }}
          width={screenWidth - 32}
          height={220}
          withDots={false}
          withInnerLines={false}
          withOuterLines={false}
          bezier
          style={styles.chart}
          chartConfig={{
            backgroundGradientFrom: "#111217",
            backgroundGradientTo: "#111217",
            decimalPlaces: 0,
            color: () => "#CFF008",
            labelColor: () => "#A0A3A7",
            propsForBackgroundLines: {
              strokeDasharray: "",
            },
          }}
        />
      </View>

      {/* Add movement button */}
      <View style={styles.addWrapper}>
        <TouchableOpacity style={styles.addButton} onPress={handleAddMovement}>
          <Text style={styles.addButtonText}>Add movement</Text>
        </TouchableOpacity>
      </View>

      {/* Last movements */}
      <View style={styles.listWrapper}>
        <Text style={styles.sectionTitle}>Recent movements</Text>
        {transactions.length === 0 ? (
          <Text style={styles.emptyText}>
            You have no movements yet. Start by adding one.
          </Text>
        ) : (
          transactions
            .slice()
            .reverse()
            .slice(0, 8)
            .map((t) => {
              const isIncome = t.type === "income";
              const color = isIncome ? "#51FF80" : "#FF4D6A";
              const sign = isIncome ? "+" : "-";
              const date = new Date(t.created_at);

              return (
                <View key={t.id} style={styles.movementRow}>
                  <View>
                    <Text style={styles.movementCategory}>
                      {t.category || "Other"}
                    </Text>
                    <Text style={styles.movementDate}>
                      {date.toLocaleString("es-ES", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </Text>
                  </View>
                  <Text style={[styles.movementAmount, { color }]}>
                    {sign}$
                    {Number(t.amount).toLocaleString("es-CO", {
                      maximumFractionDigits: 0,
                    })}
                  </Text>
                </View>
              );
            })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050609",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  center: {
    flex: 1,
    backgroundColor: "#050609",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    marginBottom: 12,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
  },
  headerSubtitle: {
    color: "#A0A3A7",
    marginTop: 4,
  },
  balanceCard: {
    backgroundColor: "#111217",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#CFF008",
    marginBottom: 16,
  },
  balanceLabel: {
    color: "#A0A3A7",
    fontSize: 14,
  },
  balanceValue: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    marginTop: 6,
  },
  reRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  reCol: {},
  reLabel: {
    color: "#A0A3A7",
    fontSize: 13,
  },
  reValue: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 2,
  },
  aiButton: {
    marginTop: 16,
    backgroundColor: "#CFF008",
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: "center",
  },
  aiButtonText: {
    color: "#050609",
    fontWeight: "700",
    fontSize: 14,
  },
  periodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  periodButton: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#2B2D33",
    paddingVertical: 6,
    marginHorizontal: 4,
    alignItems: "center",
  },
  periodButtonActive: {
    borderColor: "#CFF008",
    backgroundColor: "#181A1F",
  },
  periodText: {
    color: "#A0A3A7",
    fontSize: 13,
    fontWeight: "600",
  },
  periodTextActive: {
    color: "#CFF008",
  },
  chartCard: {
    backgroundColor: "#111217",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  chart: {
    marginTop: 8,
    alignSelf: "center",
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    paddingHorizontal: 8,
  },
  addWrapper: {
    alignItems: "center",
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: "#CFF008",
    borderRadius: 999,
    paddingHorizontal: 28,
    paddingVertical: 10,
  },
  addButtonText: {
    color: "#050609",
    fontWeight: "700",
    fontSize: 14,
  },
  listWrapper: {
    backgroundColor: "#111217",
    borderRadius: 16,
    padding: 12,
  },
  emptyText: {
    color: "#A0A3A7",
    fontSize: 13,
    marginTop: 6,
  },
  movementRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#2B2D33",
  },
  movementCategory: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  movementDate: {
    color: "#7C7F83",
    fontSize: 11,
    marginTop: 2,
  },
  movementAmount: {
    fontSize: 15,
    fontWeight: "700",
  },
  pageHeader: {
  marginTop: 32,     // 🔥 Baja el header
  marginBottom: 30,
  alignItems: "center", // 🔥 Centra TODO
  },

  pageTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",  // 🔥 Centrado
  },

  pageDivider: {
    height: 1,
    backgroundColor: "#CFF008",
    width: "100%",        // 🔥 Igual al estilo Figma (no full width)
    marginTop: 6,
    borderRadius: 4,
  },
});
