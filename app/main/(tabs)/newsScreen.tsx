// --- NewsScreen (versión actualizada con cambios del diseño) ---

import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function NewsScreen() {
  const router = useRouter();
  const [news, setNews] = useState<any[]>([]);
  const [filteredNews, setFilteredNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("featured");
  const [search, setSearch] = useState("");

  const API_KEY = process.env.EXPO_PUBLIC_NEWS_API_KEY;

  const categoryQueries: any = {
    featured: "finanzas OR economía OR inversión OR mercados financieros",
    criptos: "bitcoin OR ethereum OR criptomonedas OR crypto",
    acciones: "bolsa OR acciones OR mercado bursátil OR wall street",
    divisas: "dólar OR euro OR divisas OR forex OR tipo de cambio",
  };

  const fetchNews = async () => {
    setLoading(true);
    const query = categoryQueries[category];

    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
      query
    )}&language=es&sortBy=publishedAt&pageSize=10&apiKey=${API_KEY}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== "ok") {
        setNews([]);
        return;
      }

      setNews(data.articles);
    } catch {
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [category]);

  useEffect(() => {
    if (search.trim() === "") setFilteredNews(news);
    else {
      const term = search.toLowerCase();
      const result = news.filter(
        (n) =>
          (n.title?.toLowerCase() || "").includes(term) ||
          (n.description?.toLowerCase() || "").includes(term)
      );
      setFilteredNews(result);
    }
  }, [search, news]);

  const sectionTitles: any = {
    featured: "Featured News",
    criptos: "Crypto News",
    acciones: "Stocks News",
    divisas: "Forex & Currencies",
  };


  return (
    <View style={styles.container}>
      {/* SEARCH BAR */}
      <View style={styles.searchWrapper}>
        <Feather name="search" size={20} color="#555" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search news..."
          placeholderTextColor="#777"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* CATEGORY BUTTONS */}
      <View style={styles.categoryContainer}>
        <View style={styles.categoryInner}>

          {/* Featured */}
          <TouchableOpacity
            onPress={() => setCategory("featured")}
            style={[
              styles.categoryButton,
              category === "featured" && styles.categoryButtonActive
            ]}
          >
            <Feather
              name="star"
              size={24}
              color={category === "featured" ? "#131313" : "#FFFFFF"}
            />
          </TouchableOpacity>

          {/* Criptos */}
          <TouchableOpacity
            onPress={() => setCategory("criptos")}
            style={[
              styles.categoryButton,
              category === "criptos" && styles.categoryButtonActive
            ]}
          >
            <Feather
              name="trending-up"
              size={24}
              color={category === "criptos" ? "#131313" : "#FFFFFF"}
            />
          </TouchableOpacity>

          {/* Acciones */}
          <TouchableOpacity
            onPress={() => setCategory("acciones")}
            style={[
              styles.categoryButton,
              category === "acciones" && styles.categoryButtonActive
            ]}
          >
            <Feather
              name="bar-chart-2"
              size={24}
              color={category === "acciones" ? "#131313" : "#FFFFFF"}
            />
          </TouchableOpacity>

          {/* Divisas */}
          <TouchableOpacity
            onPress={() => setCategory("divisas")}
            style={[
              styles.categoryButton,
              category === "divisas" && styles.categoryButtonActive
            ]}
          >
            <Feather
              name="dollar-sign"
              size={24}
              color={category === "divisas" ? "#131313" : "#FFFFFF"}
            />
          </TouchableOpacity>

        </View>
      </View>

      {/* FEATURED NEWS */}
      <View style={styles.featuredBox}>
        <Text style={styles.sectionTitle}>{sectionTitles[category]}</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#CFF008" style={{ marginTop: 20 }} />
        ) : (
          <ScrollView style={{ marginTop: 10 }}>

            {filteredNews.map((item, index) => (
              <View key={index} style={styles.card}>

                {/* Press to open the article */}
                <TouchableOpacity onPress={() => Linking.openURL(item.url)}>
                  {item.urlToImage && (
                    <Image source={{ uri: item.urlToImage }} style={styles.image} />
                  )}

                  <View style={styles.cardContent}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.readMore}>Read news →</Text>
                  </View>
                </TouchableOpacity>

                {/* 🟢 Botón: Pedir asistencia a la IA */}
                <TouchableOpacity
                  style={{
                    backgroundColor: "#CFF008",
                    paddingVertical: 8,
                    borderRadius: 8,
                    marginTop: 10,
                    alignItems: "center",
                  }}
                  onPress={() =>
                    router.push({
                      pathname: "/main/(tabs)/chatbot",
                      params: {
                        fromNews: "1",
                        title: item.title,
                        description: item.description,
                        url: item.url,
                        image: item.urlToImage,
                      },
                    })
                  }
                >
                  <Text style={{ color: "#050609", fontWeight: "700" }}>
                    Preguntar a la IA
                  </Text>
                </TouchableOpacity>

              </View>
            ))}

            {filteredNews.length === 0 && (
              <Text style={styles.noResult}>No results found</Text>
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );
}




const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#131313",
      padding: 15,
    },
    headerWrapper: {
      marginTop: 30,
      marginBottom: 15,
    },
    header: {
      fontSize: 28,
      fontWeight: "700",
      color: "#FFFFFF",
      textAlign: "center",
      letterSpacing: 1.5,
    },
    headerLine: {
      height: 1,
      backgroundColor: "#CFF008",
      width: "100%",
      marginTop: 10,
    },
    searchWrapper: {
      marginTop: 0,
      marginBottom: 20,
      backgroundColor: "#FFFFFF",
      borderRadius: 12,
      padding: 12,
      flexDirection: "row",
      alignItems: "center",
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      color: "#000",
      fontSize: 15,
    },
    categoryContainer: {
      borderWidth: 1,
      borderColor: "#55610eff",
      borderRadius: 12,
      padding: 12,
      marginBottom: 20,
    },
    categoryInner: {
      flexDirection: "row",
      justifyContent: "space-around",
    },
    categoryButton: {
      width: 55,
      height: 55,
      backgroundColor: "#CFF008",
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
    },
    categoryButtonActive: {
      backgroundColor: "#FFFFFF",
    },
    featuredBox: {
      borderWidth: 1,
      borderColor: "#55610eff",
      borderRadius: 12,
      padding: 12,
      flex: 1,
    },
    sectionTitle: {
      color: "#FFFFFF",
      fontSize: 18,
      fontWeight: "700",
    },
    card: {
      backgroundColor: "#1F1F1F",
      borderRadius: 12,
      marginBottom: 15,
      overflow: "hidden",
      paddingBottom: 10,
    },
    image: {
      width: "100%",
      height: 140,
    },
    cardContent: {
      padding: 12,
    },
    title: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "600",
      marginBottom: 5,
    },
    readMore: {
      color: "#CFF008",
      fontWeight: "600",
    },
    noResult: {
      color: "#8F8F8F",
      textAlign: "center",
      marginTop: 20,
    },
  });
