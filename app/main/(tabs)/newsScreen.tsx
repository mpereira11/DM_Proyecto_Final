import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Linking,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function NewsScreen() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const API_KEY = process.env.EXPO_PUBLIC_NEWS_API_KEY;

  const buildUrl = (pageNumber: number) =>
    `https://newsapi.org/v2/everything?q=(finanzas OR inversion OR "mercados financieros" OR bolsa OR "criptomonedas" OR economia OR "tasa de interés" OR "política monetaria" OR Colombia OR Latinoamérica)&language=es&pageSize=10&page=${pageNumber}&sortBy=publishedAt&apiKey=${API_KEY}`;

  const fetchNews = async (pageNumber = 1, append = false) => {
    try {
      if (!append) setLoading(true);
      setError("");

      const response = await fetch(buildUrl(pageNumber));
      const data = await response.json();

      if (data.status !== "ok") {
        setError(`Error de API: ${data.message || "Desconocido"}`);
        return;
      }

      const filteredArticles = (data.articles || []).filter((a: any) => {
        const title = a.title?.toLowerCase() || "";
        const desc = a.description?.toLowerCase() || "";
        const source = a.source?.name?.toLowerCase() || "";

        const keywords = [
          "finanz",
          "econom",
          "bolsa",
          "cripto",
          "mercado",
          "inversi",
          "banco",
          "inflación",
          "dólar",
          "acciones",
          "tasas",
          "negocios",
        ];

        const isRelevant =
          keywords.some((k) => title.includes(k) || desc.includes(k)) ||
          ["forbes", "expansión", "el economista", "bloomberg", "milenio"].some(
            (f) => source.includes(f)
          );

        return isRelevant;
      });

      if (append) setNews((prev) => [...prev, ...filteredArticles]);
      else setNews(filteredArticles);
    } catch {
      setError("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchNews();
    const interval = setInterval(() => fetchNews(1), 1000 * 60 * 15);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchNews(1);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    setLoadingMore(true);
    fetchNews(nextPage, true);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={{ marginTop: 10, color: "#555" }}>Cargando noticias...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#d9534f", textAlign: "center", marginHorizontal: 20 }}>
          {error}
        </Text>
        <TouchableOpacity onPress={() => fetchNews(page)} style={styles.retryBtn}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#000"
        />
      }
    >
      {news.map((article, index) => (
        <TouchableOpacity
          key={index}
          style={styles.card}
          activeOpacity={0.9}
          onPress={() => {
            if (article.url) Linking.openURL(article.url);
          }}
        >
          {article.urlToImage && (
            <Image source={{ uri: article.urlToImage }} style={styles.image} />
          )}
          <View style={styles.cardContent}>
            <Text style={styles.title}>{article.title}</Text>

            {article.author && (
              <Text style={styles.author}>✍️ {article.author}</Text>
            )}

            {article.publishedAt && (
              <Text style={styles.date}>
                {new Date(article.publishedAt).toLocaleString("es-ES", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </Text>
            )}

            <Text style={styles.desc}>
              {article.description
                ? article.description
                : "Lee la noticia completa..."}
            </Text>

            <Text style={styles.link}>Ver más →</Text>
          </View>
        </TouchableOpacity>
      ))}

      <View style={{ alignItems: "center", marginBottom: 30 }}>
        {loadingMore ? (
          <ActivityIndicator size="small" color="#000" />
        ) : (
          <TouchableOpacity onPress={loadMore} style={styles.loadMoreBtn}>
            <Text style={styles.loadMoreText}>Cargar más noticias</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f2f6", // 👈 gris claro que diferencia las tarjetas
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f2f6",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 0.5,
    borderColor: "#e3e3e3",
  },
  image: {
    width: "100%",
    height: 180,
  },
  cardContent: {
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#222",
    marginBottom: 6,
  },
  author: {
    fontSize: 13,
    color: "#666",
    marginBottom: 3,
  },
  date: {
    fontSize: 12,
    color: "#999",
    marginBottom: 8,
  },
  desc: {
    fontSize: 14,
    color: "#444",
    marginBottom: 8,
  },
  link: {
    color: "#007aff",
    fontWeight: "600",
    marginTop: 4,
  },
  retryBtn: {
    backgroundColor: "#007aff",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  retryText: {
    color: "#fff",
    fontWeight: "700",
  },
  loadMoreBtn: {
    backgroundColor: "#007aff",
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 8,
  },
  loadMoreText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});
