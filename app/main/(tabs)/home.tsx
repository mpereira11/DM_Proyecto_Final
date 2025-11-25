import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/utils/supabase";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// Importa el hook useRouter de Expo Router
import { useRouter } from "expo-router";
// Importa los iconos de Expo
import { Ionicons } from '@expo/vector-icons';

// Interfaz para la transacción basada en FinanceScreen.tsx
interface Transaction {
  id: number;
  user_id: string;
  amount: number;
  type: "income" | "expense";
  category: string | null;
  note: string | null;
  created_at: string;
}

// Interfaz para el artículo de noticias
interface NewsArticle {
    title: string;
    url: string;
    urlToImage: string | null;
    source: {
        name: string;
    };
}

type Period = "daily" | "weekly" | "monthly";
type NewsCategory = "featured" | "criptos" | "acciones" | "divisas";

export default function HomeScreen() {
  // Inicializamos el router para la navegación
  const router = useRouter();

  const [period, setPeriod] = useState<Period>("monthly");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [expenses, setExpenses] = useState(0);
  
  // --- Estados y Lógica de Noticias ---
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [newsCategory, setNewsCategory] = useState<NewsCategory>("featured");
  
  // Usamos solo un artículo principal para la sección de Home (el primer resultado)
  const mainNewsArticle = news.length > 0 ? news[0] : null;

  // Usa la misma clave y queries que en tu NewsScreen
  const API_KEY = process.env.EXPO_PUBLIC_NEWS_API_KEY;

  const categoryQueries: Record<NewsCategory, string> = {
    featured: "finanzas OR economía OR inversión OR mercados financieros",
    criptos: "bitcoin OR ethereum OR criptomonedas OR crypto",
    acciones: "bolsa OR acciones OR mercado bursátil OR wall street",
    divisas: "dólar OR euro OR divisas OR forex OR tipo de cambio",
  };

  const fetchNews = async (cat: NewsCategory) => {
    setLoadingNews(true);
    const query = categoryQueries[cat];

    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
      query
    )}&language=es&sortBy=publishedAt&pageSize=1&apiKey=${API_KEY}`; // Solo 1 noticia para el Home

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== "ok") {
        setNews([]);
        return;
      }

      setNews(data.articles.filter((a: any) => a.urlToImage)); // Filtrar los que no tienen imagen
    } catch (e) {
        console.error("Error fetching news:", e);
      setNews([]);
    } finally {
      setLoadingNews(false);
    }
  };
  
  // Cargar noticias al iniciar
  useEffect(() => {
    fetchNews("featured");
  }, []);
  
  // --- Lógica Financiera ---

  const { session } = useAuth();

  // Función de cálculo/filtrado reutilizable
  const calculateFinancialData = useCallback(
    (allTransactions: Transaction[], currentPeriod: Period) => {
      let fromDate = new Date();
      const now = new Date();

      if (currentPeriod === "daily") {
        fromDate.setDate(now.getDate() - 1);
      } else if (currentPeriod === "weekly") {
        fromDate.setDate(now.getDate() - 7);
      } else {
        fromDate.setDate(now.getDate() - 30); // Por defecto, 30 días para mensual
      }

      // 1. Filtrar las transacciones por el periodo seleccionado
      const filteredTransactions = allTransactions.filter(
        (t) => new Date(t.created_at).getTime() >= fromDate.getTime()
      );

      // 2. Calcular Ingresos y Gastos solo de las transacciones filtradas
      let rev = 0; // Ingresos (income)
      let exp = 0; // Gastos (expense)

      filteredTransactions.forEach((t: Transaction) => {
        const amount = Number(t.amount);
        if (t.type === "income") {
          rev += amount;
        } else if (t.type === "expense") {
          exp += amount;
        }
      });

      // 3. Actualizar los estados
      setRevenue(rev);
      setExpenses(exp);
    },
    []
  );

  // Fetch all transactions and store them
  async function fetchAllTransactions() {
    if (!session?.user) return;

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", session.user.id);

    if (error) {
      console.log("Error loading transactions:", error);
      return;
    }

    const fetchedTransactions = data as Transaction[];
    // Almacenamos todas las transacciones
    setTransactions(fetchedTransactions);
    // Aplicamos el cálculo inicial de revenue/expenses con el periodo actual
    calculateFinancialData(fetchedTransactions, period);
    
    // Cálculo del BALANCE TOTAL (sobre todas las transacciones, no solo el periodo)
    let totalRev = 0;
    let totalExp = 0;
    fetchedTransactions.forEach((t: Transaction) => {
      const amount = Number(t.amount);
      if (t.type === "income") {
        totalRev += amount;
      } else if (t.type === "expense") {
        totalExp += amount;
      }
    });
    setBalance(totalRev - totalExp);
  }

  // Effect para la carga inicial y la suscripción
  useEffect(() => {
    if (!session?.user) return;

    fetchAllTransactions();

    const channel = supabase
      .channel("home-transactions")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "transactions",
          filter: `user_id=eq.${session.user.id}`,
        },
        () => {
          // Si hay un cambio, volvemos a cargar todo
          fetchAllTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  // Effect que recalcula los datos de Revenue/Expenses cuando cambia el periodo o las transacciones base
  useEffect(() => {
    calculateFinancialData(transactions, period);
  }, [period, transactions, calculateFinancialData]);

  // --- HANDLERS DE NAVEGACIÓN ---

  // 1. Manejador para el botón "See all" de Noticias
  const handleSeeAllNews = () => {
    router.push("/main/(tabs)/newsScreen");
  };

  // 2. Manejador para el botón "IA Suggestion"
  const handleAISuggestion = () => {
    router.push({
      pathname: "/main/(tabs)/chatbot",
      params: {
        fromFinance: "true",
        income: revenue.toString(), // Usamos revenue (ingresos del periodo)
        expenses: expenses.toString(), // Usamos expenses (gastos del periodo)
        balance: balance.toString(), // Usamos balance total
      },
    });
  };

  // --- RENDERING ---

  // Estilos simplificados para botones de periodo
  const periodButtonStyle = (p: Period) => [
    styles.periodButton,
    period === p ? styles.periodButtonActive : styles.periodButtonInactive,
  ];

  const periodTextStyle = (p: Period) => [
    styles.periodText,
    period === p ? styles.periodTextActive : styles.periodTextInactive, 
  ];
  
  // Helper para abrir la noticia
  const handlePressNews = () => {
      if (mainNewsArticle?.url) {
          Linking.openURL(mainNewsArticle.url);
      }
  };


  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>

      {/* TOTAL BALANCE CARD */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceTitle}>Total Balance</Text>
        <Text style={styles.balanceValue}>
          {/* Mantenemos tus espacios en blanco por tu solicitud */}
          ⠀⠀${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </Text>
      </View>

      {/* AI BUTTON - APLICACIÓN DEL HANDLER */}
      <TouchableOpacity style={styles.aiButton} onPress={handleAISuggestion}>
        <Ionicons name="chatbox-outline" size={18} color="#050609" style={{ marginRight: 8 }} />
        <Text style={styles.aiText}>IA Suggestion Or News Comment</Text>
      </TouchableOpacity>
      
      {/* 🟢 TARJETA UNIFICADA (PERIOD SELECTOR + REVENUE & EXPENSES) 🟢 */}
      <View style={styles.periodAndReCard}>
        
        {/* PERIOD SELECTOR: Botones individuales con fondo blanco al estar inactivos */}
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

        {/* REVENUE & EXPENSES */}
        <View style={styles.reSection}>
          {/* Revenue Row */}
          <View style={styles.reRow}>
            <View style={styles.reItem}>
                <View style={[styles.iconCircle, { backgroundColor: "#CFF008" }]}>
                   {/* Icono de AntDesign agregado */}
                </View>
                <Text style={styles.reLabel}>Revenue</Text>
            </View>
            <Text style={styles.reAmountGreen}>
              +${revenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </Text>
          </View>

          {/* Expenses Row */}
          <View style={styles.reRow}>
            <View style={styles.reItem}>
                {/* Cambiado el color de fondo a rojo, y el icono a blanco */}
                <View style={[styles.iconCircle, { backgroundColor: "#CFF008" }]}>
                </View>
                <Text style={styles.reLabel}>Expenses</Text>
            </View>
            <Text style={styles.reAmountRed}>
              -${expenses.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </Text>
          </View>
        </View>
      </View>

      {/* 🟢 NEWS SECTION (NUEVA TARJETA CON BORDE NEÓN) 🟢 */}
      <View style={styles.newsCardContainer}>
        <View style={styles.newsHeader}>
          <Text style={styles.newsTitle}>News</Text>
          {/* "SEE ALL" BUTTON - APLICACIÓN DEL HANDLER */}
          <TouchableOpacity onPress={handleSeeAllNews}>
            <Text style={styles.seeAll}>See all</Text>
            {/* Se elimina la línea 'router.push("/main/(tabs)/newsScreen");' que estaba incorrectamente dentro del JSX */}
          </TouchableOpacity>
        </View>

        {loadingNews ? (
             <ActivityIndicator size="large" color="#CFF008" style={{ paddingVertical: 20 }} />
        ) : mainNewsArticle ? (
            <TouchableOpacity style={styles.newsCard} onPress={handlePressNews}>
                {/* Usamos un fallback si la URL de la imagen no funciona */}
                <Image
                    source={{ uri: mainNewsArticle.urlToImage! }}
                    style={styles.newsImg}
                    onError={({ nativeEvent: { error } }) => console.log('Image failed to load:', error)}
                />
                <View style={styles.newsContent}>
                    <Text style={styles.newsHeadline}>{mainNewsArticle.title}</Text>
                    <Text style={styles.readMore}>Read news →</Text>
                </View>
            </TouchableOpacity>
        ) : (
            <Text style={styles.noNewsText}>No hay noticias disponibles en este momento.</Text>
        )}
      </View>
      
    </ScrollView>
  );
}

// --- ESTILOS AJUSTADOS (Manteniendo el estilo original del usuario y añadiendo newsCardContainer) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050609",
    paddingHorizontal: 16,
  },

  /* HEADER (Mantenidos en CSS por referencia) */
  headerText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 18,
    marginBottom: 15,
  },
  headerDivider: {
    height: 3,
    backgroundColor: "#CFF008",
    width: "100%", 
    borderRadius: 4,
    marginBottom: 20,
  },

  /* BALANCE CARD */
  balanceCard: {
    backgroundColor: "#111217",
    borderWidth: 1,
    borderColor: "#55610eff",
    paddingVertical: 30, // Más padding para centrar verticalmente
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 20,
    marginTop: 10,  // Centrar horizontalmente
  },
  balanceTitle: {
    color: "#FFFFFF",
    fontSize: 20,
  },
  balanceValue: {
    color: "#FFFFFF",
    fontSize: 32, // Tamaño mantenido
    fontWeight: "800",
    marginTop: 6,
  },

  /* AI BUTTON */
  aiButton: {
    flexDirection: 'row',
    backgroundColor: "#CFF008",
    paddingVertical: 18, // Ajustado padding
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  aiText: {
    color: "#050609",
    fontSize: 16,
    fontWeight: "500",
  },
  
  // 🟢 TARJETA UNIFICADA (PERIOD SELECTOR + REVENUE & EXPENSES)
  periodAndReCard: {
    backgroundColor: "#111217",
    padding: 16,
    borderRadius: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#55610eff",
  },

  /* PERIOD SELECTOR */
  periodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15, 
    padding: 0,
    borderRadius: 999,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 999,
    alignItems: "center",
  },
  periodButtonActive: {
    backgroundColor: "#CFF008",
    marginHorizontal: 0, 
  },
  periodButtonInactive: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 4, // Separación entre inactivos
  },
  periodText: {
    fontWeight: "600",
  },
  periodTextActive: {
    color: "#050609", 
    fontWeight: "700",
  },
  periodTextInactive: {
    color: "#050609",
  },

  /* REVENUE / EXPENSES */
  reSection: {
    marginTop: 3,
  },
  reRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  reItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 8,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reLabel: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 18,
  },
  reAmountGreen: {
    color: "#51FF80",
    fontWeight: "500",
    fontSize: 17,
  },
  reAmountRed: {
    color: "#FF4D6A",
    fontWeight: "500",
    fontSize: 17,
  },
  
  // --- NUEVOS ESTILOS PARA LA TARJETA DE NOTICIAS CON BORDE NEÓN ---
  newsCardContainer: {
    backgroundColor: "#111217",
    borderWidth: 1,
    borderColor: "#55610eff", // Borde neón
    padding: 16,
    borderRadius: 14,
    marginBottom: 20,
  },
  // --- FIN DE NUEVOS ESTILOS ---

  /* NEWS SECTION - Mantiene la disposición interna */
  newsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  newsTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  seeAll: {
    color: "#CFF008",
    fontSize: 14,
    fontWeight: "600",
  },
  noNewsText: {
      color: "#FFFFFF",
      textAlign: 'center',
      paddingVertical: 20,
      opacity: 0.7,
  },

  /* NEWS CARD - El estilo del contenido de la noticia en sí (sin borde externo) */
  newsCard: {
    flexDirection: "row",
    backgroundColor: "#050609", // Fondo muy oscuro para el contenido de la noticia
    borderRadius: 10, // Un poco menos redondeado para distinguirse del contenedor principal
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#2B2D33", // Borde sutil
  },
  newsImg: {
    width: 120,
    height: 90,
  },
  newsContent: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  newsHeadline: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  readMore: {
    color: "#CFF008",
    marginTop: 6,
    fontWeight: "600",
  },
});