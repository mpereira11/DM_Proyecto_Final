import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Alert, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";


export default function CoursesScreen() {
  const { session } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savingModalVisible, setSavingModalVisible] = useState(false); // Estado para el modal de "Saving"
  const [investingModalVisible, setInvestingModalVisible] = useState(false); // Estado para el modal de "Investing for Beginners"
  const [cryptoModalVisible, setCryptoModalVisible] = useState(false); // Estado para el modal de "Cryptocurrency"



  const sections = [
    {
      category: "Personal Finance",
      courses: [
        "Saving",
        "Smart Budgeting",
        "Expense Tracking",
        "Emergency Fund",
        "Money Psychology",
        "Credit Card Management",
      ],
    },
    {
      category: "Investments",
      courses: [
        "Investing for Beginners",
        "Long-term Investing",
        "Index Funds",
        "ETFs and Mutual Funds",
        "Stock Market Basics",
        "Dividend Stocks",
        "Bonds (Fixed Income)",
      ],
    },
    {
      category: "Alternative Investments",
      courses: [
        "Cryptocurrency (Beginner)",
        "Cryptocurrency (Intermediate)",
        "Real Estate",
        "Real Estate Crowdfunding",
        "Gold & Precious Metals",
      ],
    },
    {
      category: "Debt Management",
      courses: [
        "Eliminating Debt",
        "Snowball vs Avalanche Method",
        "Negotiating with Banks",
        "Avoiding Financial Scams",
      ],
    },
    {
      category: "Financial Planning",
      courses: [
        "Retirement Planning",
        "Pension & Voluntary Savings",
        "Financial Education for Youth",
      ],
    },
    {
      category: "Business & Entrepreneurship",
      courses: [
        "Starting a Business from Scratch",
        "Financial Intelligence for Entrepreneurs",
        "Business Financial Control",
      ],
    },
    {
      category: "Taxes",
      courses: [
        "Taxes Introduction",
        "VAT, Income & Withholdings",
        "How to File Taxes",
      ],
    },
    {
      category: "Advanced Finance",
      courses: [
        "Day Trading",
        "Professional Trading",
        "Technical Analysis",
        "Fundamental Analysis",
        "Risk Management in Investments",
      ],
    },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      if (!session?.user) return;
      const { data, error } = await supabase
        .from("users_app")
        .select("*")
        .eq("email", session.user.email)
        .single();

      if (error) {
        Alert.alert("Error", "Could not fetch user info");
      } else {
        setUser(data);
      }
      setLoading(false);
    };

    fetchUser();
  }, [session]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Si el usuario NO es premium
  if (user?.status !== "premium") {
    return (
      <View style={styles.premiumContainer}>
        <Text style={styles.premiumText}>
          You need to upgrade to the Premium plan to access these courses.
        </Text>
      </View>
    );
  }

  const handleCoursePress = (courseTitle: string) => {
    if (courseTitle === "Saving") {
      setSavingModalVisible(true);
    } else if (courseTitle === "Investing for Beginners") {
      setInvestingModalVisible(true);
    } else if (courseTitle === "Cryptocurrency (Beginner)") {
      setCryptoModalVisible(true);
    } else {
      Alert.alert("Course selected", `You selected: ${courseTitle}`);
    }
  };



  // Si es premium, mostramos la lista completa
  return (
    <View style={{ flex: 1, backgroundColor: "#050609", paddingTop: 15 }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 50 }}>
        {sections.map((section, index) => (
          <View key={index} style={{ marginBottom: 35 }}>
            {/* 🔹 CATEGORY NAME */}
            <Text style={styles.sectionTitle}>
              {section.category}
            </Text>

            {/* 🔹 LIST OF COURSES */}
            {section.courses.map((title, idx) => (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.7}
                style={styles.courseItem}
                onPress={() => handleCoursePress(title)}
              >
                <Ionicons
                  name="play-circle-outline"
                  size={32}
                  color="#CFF008"
                  style={{ marginRight: 16 }}
                />

                <Text
                  style={styles.courseTitle}
                >
                  {title}
                </Text>

                <View style={{ flex: 1 }} />

                <Ionicons
                  name="chevron-forward-outline"
                  size={26}
                  color="#CFF008"
                />
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* Modal for "Saving" */}
      <Modal
        visible={savingModalVisible}
        animationType="slide"
        onRequestClose={() => setSavingModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <ScrollView contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 20 }}>

            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderText}>Saving</Text>
              <View style={styles.modalHeaderLine} />
            </View>

            {/* YouTube Video */}
            <View style={{ marginVertical: 20 }}>
              <YoutubePlayer
                height={220}
                play={false}
                videoId="HQzoZfc3GwQ"
                initialPlayerParams={{ start: 262 }}
              />
            </View>

            {/* Content */}

            <Text style={styles.sectionHeading}>What is Saving?</Text>
            <Text style={styles.sectionText}>
              Saving is the process of intentionally setting aside a portion of your income 
              for future needs. It involves delaying immediate consumption to build financial 
              security, achieve goals, and prepare for unexpected events.{"\n\n"}
              Saving is not only about having money — it is about creating stability, reducing 
              stress, and making your life more predictable.
            </Text>

            <Text style={styles.sectionHeading}>Why Is Saving Important?</Text>
            <Text style={styles.sectionText}>
              Saving is essential because it allows you to:{"\n"}
              • Handle emergencies without debt.{"\n"}
              • Achieve big goals (travel, education, buying a car, a home).{"\n"}
              • Improve financial stability and peace of mind.{"\n"}
              • Avoid living paycheck-to-paycheck.{"\n"}
              • Take advantage of future opportunities (investing, entrepreneurship).{"\n\n"}
              Saving is the foundation of all good financial habits. Without savings, 
              any financial plan is unstable.
            </Text>

            <Text style={styles.sectionHeading}>Types of Saving</Text>
            <Text style={styles.sectionText}>
              **1. Emergency Savings**{"\n"}
              Money set aside for unexpected events: medical bills, car repairs, job loss.{"\n"}
              Recommended: 3–6 months of basic expenses.{"\n\n"}

              **2. Short-Term Savings**{"\n"}
              Goals within 1–3 years: travel, a computer, furniture, tuition.{"\n\n"}

              **3. Long-Term Savings**{"\n"}
              Goals beyond 3 years: a house, children’s education, retirement.{"\n\n"}

              **4. Automatic Savings**{"\n"}
              Money transferred automatically each month — the most effective method.{"\n\n"}

              **5. High-Yield Savings**{"\n"}
              Accounts that offer higher interest, ideal for growing money safely.
            </Text>

            <Text style={styles.sectionHeading}>How Much Should You Save?</Text>
            <Text style={styles.sectionText}>
              A common and effective method is the **50/30/20 rule**:{"\n\n"}
              • 50% → Needs (rent, food, transportation){"\n"}
              • 30% → Wants (restaurants, clothing, hobbies){"\n"}
              • 20% → Savings and debt repayment{"\n\n"}

              If 20% is too high for your current situation, start small.  
              Saving **even 2% or 5%** of your income consistently is better than 0%.
            </Text>

            <Text style={styles.sectionHeading}>How to Start Saving</Text>
            <Text style={styles.sectionText}>
              Here are practical steps to begin saving today:{"\n\n"}
              • **Track your expenses** — know where your money goes.{"\n"}
              • **Set a fixed amount to save each month** — even small amounts matter.{"\n"}
              • **Create a separate savings account** — avoid mixing with spending money.{"\n"}
              • **Automate transfers** — this prevents relying on willpower.{"\n"}
              • **Reduce unnecessary recurring expenses** — subscriptions, food delivery.{"\n"}
              • **Use envelopes or budget categories** to organize money.{"\n"}
              • **Define clear goals** — saving is easier when it has a purpose.
            </Text>

            <Text style={styles.sectionHeading}>Real-Life Examples</Text>
            <Text style={styles.sectionText}>
              • Saving $3 per day from coffee = ~$90 per month = **$1,080 per year**.{"\n"}
              • Saving 10% of a $1,000 monthly income = **$100 per month**.{"\n"}
              • Cutting delivery food twice a week = saves ~$40–60 weekly.{"\n"}
              • Negotiating your phone or internet bill = extra $10–20 saved monthly.{"\n\n"}
              Small decisions add up over time — building savings is about consistency, 
              not one-time sacrifices.
            </Text>

            <Text style={styles.sectionHeading}>Key Financial Concepts</Text>
            <Text style={styles.sectionText}>
              **Liquidity** — how fast you can access your money. Savings must be liquid.{"\n\n"}
              **Interest** — extra money earned by keeping funds in a savings account.{"\n\n"}
              **Inflation** — rising prices over time; saving protects you from becoming vulnerable.{"\n\n"}
              **Compound interest** — interest earned on interest; savings grow exponentially.
            </Text>

            <Text style={styles.sectionHeading}>Good Saving Habits</Text>
            <Text style={styles.sectionText}>
              - Pay yourself first (save before spending).{"\n"}
              - Automate contributions.{"\n"}
              - Review your budget monthly.{"\n"}
              - Set SMART goals: Specific, Measurable, Achievable, Realistic, Time-bound.{"\n"}
              - Keep your savings separate from everyday spending.{"\n"}
              - Celebrate small milestones (500 saved, 1,000 saved).
            </Text>

            <Text style={styles.sectionHeading}>Common Saving Mistakes</Text>
            <Text style={styles.sectionText}>
              • Saving only “what’s left” — instead, save first.{"\n"}
              • Keeping emergency funds in cash at home.{"\n"}
              • Using credit cards for emergencies instead of a savings fund.{"\n"}
              • Confusing saving with investing (they are different).{"\n"}
              • Underestimating small expenses (the “$5 a day” trap).
            </Text>

            <Text style={styles.sectionHeading}>Tools & Methods You Can Use</Text>
            <Text style={styles.sectionText}>
              • Budgeting apps: Mint, Copilot, Notion templates.{"\n"}
              • Automatic transfers or standing orders.{"\n"}
              • Envelope/cash method.{"\n"}
              • High-yield savings accounts.{"\n"}
              • 52-week savings challenge.{"\n"}
              • Percentage-based saving (10%, 15%, 20%).
            </Text>

            <Text style={styles.sectionHeading}>FAQ</Text>
            <Text style={styles.sectionText}>
              <Text style={{ fontWeight: "700" }}>Q: How much should I save first?</Text>{"\n"}
              A: Aim for $500–$1,000 as a starter emergency fund.{"\n\n"}

              <Text style={{ fontWeight: "700" }}>Q: Should I save or invest first?</Text>{"\n"}
              A: Save an emergency fund first; then invest.{"\n\n"}

              <Text style={{ fontWeight: "700" }}>Q: Where should I keep my savings?</Text>{"\n"}
              A: In a separate high-liquidity savings account.{"\n\n"}

              <Text style={{ fontWeight: "700" }}>Q: Can I save even if I earn little?</Text>{"\n"}
              A: Yes — start with tiny amounts and build the habit.
            </Text>

            <Text style={styles.sectionHeading}>Final Thoughts</Text>
            <Text style={styles.sectionText}>
              Saving is not about restricting your life — it is about gaining control over it.{"\n"}
              When you save consistently, even in small amounts, you build a cushion that 
              protects you, empowers your goals, and prepares you for opportunities.{"\n\n"}
              **Saving is the foundation of financial freedom.**
            </Text>

            {/* Close Button */}
            <TouchableOpacity
              onPress={() => setSavingModalVisible(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Modal for "Investing for Beginners" */}
      <Modal
        visible={investingModalVisible}
        animationType="slide"
        onRequestClose={() => setInvestingModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <ScrollView contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 20 }}>

            {/* Encabezado */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderText}>Investing for Beginners</Text>
              <View style={styles.modalHeaderLine} />
            </View>

            {/* Video */}
            <View style={{ marginVertical: 20 }}>
              <YoutubePlayer
                height={220}
                play={false}
                videoId="iCzBVWdNOeE"     // ID del video
                initialPlayerParams={{ start: 956 }}
              />
            </View>

            {/* Contenido */}
            <Text style={styles.sectionHeading}>Definition</Text>
            <Text style={styles.sectionText}>
              Investing for beginners is the introduction to how money can grow over time 
              by buying assets such as stocks, bonds, index funds, ETFs, and other vehicles 
              that generate returns. It focuses on simple principles, risk management, 
              long-term thinking, and understanding how markets work.
            </Text>

            <Text style={styles.sectionHeading}>Core Concepts</Text>
            <Text style={styles.sectionText}>
              - **Return**: The profit you earn on an investment.{"\n"}
              - **Risk**: The possibility of losing money.{"\n"}
              - **Diversification**: Spreading your investments to reduce risk.{"\n"}
              - **Compound Interest**: Your money earns interest on top of interest.{"\n"}
              - **Time Horizon**: How long you plan to keep your money invested.
            </Text>

            <Text style={styles.sectionHeading}>Examples</Text>
            <Text style={styles.sectionText}>
              • Buying shares of a big company like Apple or Google.{"\n"}
              • Investing in an index fund such as the S&P 500.{"\n"}
              • Putting money into government or corporate bonds.{"\n"}
              • Purchasing ETFs that track specific markets or sectors.
            </Text>

            <Text style={styles.sectionHeading}>Analogy</Text>
            <Text style={styles.sectionText}>
              Think of investing as planting a forest:  
              one tree doesn’t change your landscape, but planting many over time 
              creates stability, strength, and long-term growth.  
              The earlier you plant, the larger your forest becomes.
            </Text>

            <Text style={styles.sectionHeading}>Tips & Advice</Text>
            <Text style={styles.sectionText}>
              1. Start small, but start early.{"\n"}
              2. Choose simple, diversified products like index funds or ETFs.{"\n"}
              3. Don’t try to time the market — consistency wins.{"\n"}
              4. Learn the basics of risk and reward before investing.{"\n"}
              5. Focus on long-term growth rather than quick profits.
            </Text>

            <Text style={styles.sectionHeading}>FAQ</Text>
            <Text style={styles.sectionText}>
              <Text style={{ fontWeight: "700" }}>Q: Is investing risky?</Text>{"\n"}
              A: All investments carry some risk, but diversification 
              and long-term strategies reduce it significantly.{"\n"}{"\n"}

              <Text style={{ fontWeight: "700" }}>Q: How much money do I need to start?</Text>{"\n"}
              A: Many platforms let you start with $10 or even less.{"\n"}{"\n"}

              <Text style={{ fontWeight: "700" }}>Q: What should I invest in as a beginner?</Text>{"\n"}
              A: Low-cost index funds or ETFs are usually the safest starting point.
            </Text>

            {/* Botón de cerrar */}
            <TouchableOpacity
              onPress={() => setInvestingModalVisible(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>

          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Modal for "Cryptocurrency (Beginner)" */}
      <Modal
        visible={cryptoModalVisible}
        animationType="slide"
        onRequestClose={() => setCryptoModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <ScrollView contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 20 }}>

            {/* Encabezado */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderText}>Cryptocurrency (Beginner)</Text>
              <View style={styles.modalHeaderLine} />
            </View>


            {/* Video YouTube */}
            <View style={{ marginVertical: 20 }}>
              <YoutubePlayer
                height={220}
                play={false}
                videoId="Zoz9gvhLgpM"
                initialPlayerParams={{ start: 50 }}
              />
            </View>

            {/* CONTENIDO DEL CURSO */}

            {/* Definition */}
            <Text style={styles.sectionHeading}>Definition</Text>
            <Text style={styles.sectionText}>
              Cryptocurrency is a form of digital or virtual money that uses cryptography 
              to secure transactions, verify ownership, and control the creation of new units. 
              Unlike traditional currencies (like dollars or euros), cryptocurrencies operate 
              on decentralized networks based on blockchain technology — meaning no single 
              government, bank, or institution controls them.
            </Text>

            {/* What is Blockchain? */}
            <Text style={styles.sectionHeading}>What is Blockchain?</Text>
            <Text style={styles.sectionText}>
              Blockchain is a distributed digital ledger that records transactions across 
              many computers around the world. Each record ("block") is linked to the previous 
              one, creating a chain that cannot be altered without changing all subsequent blocks.{"\n\n"}
              This makes blockchain extremely secure, transparent, and resistant to fraud.
            </Text>

            {/* Core Concepts */}
            <Text style={styles.sectionHeading}>Core Concepts</Text>
            <Text style={styles.sectionText}>
              - **Decentralization**: No single entity controls the network.{"\n"}
              - **Private & Public Keys**: Cryptographic tools that prove ownership of your crypto.{"\n"}
              - **Wallets**: Apps or hardware used to store cryptocurrency.{"\n"}
              - **Exchanges**: Platforms where you can buy, sell, or trade crypto.{"\n"}
              - **Mining / Staking**: Ways to validate transactions and secure the network.{"\n"}
              - **Tokens vs Coins**: Coins run on their own blockchain (Bitcoin), 
                tokens run on existing ones (Ethereum-based tokens).
            </Text>

            {/* Examples */}
            <Text style={styles.sectionHeading}>Examples of Cryptocurrencies</Text>
            <Text style={styles.sectionText}>
              • **Bitcoin (BTC)** — the first and most recognized cryptocurrency.{"\n"}
              • **Ethereum (ETH)** — a programmable blockchain used for smart contracts.{"\n"}
              • **Tether (USDT)** — a stablecoin linked to the US dollar.{"\n"}
              • **BNB** — the token used in Binance's ecosystem.{"\n"}
              • **Solana (SOL)** — a fast blockchain optimized for high-performance apps.
            </Text>

            {/* Real Uses */}
            <Text style={styles.sectionHeading}>Real-World Uses</Text>
            <Text style={styles.sectionText}>
              - International money transfers with low fees and no intermediaries.{"\n"}
              - Online purchases on platforms that accept crypto.{"\n"}
              - Long-term investment or store of value (HODL).{"\n"}
              - Decentralized Finance (DeFi) tools like lending or earning interest.{"\n"}
              - NFTs and blockchain-based gaming.
            </Text>

            {/* Analogy */}
            <Text style={styles.sectionHeading}>Analogy</Text>
            <Text style={styles.sectionText}>
              Think of cryptocurrency like digital gold stored in a global vault.  
              You own a key (your private key) that proves the gold is yours.  
              Anyone can verify that your gold exists, but only your key can unlock it.  
              The vault is never controlled by one person — it's shared by everyone.
            </Text>

            {/* Tips */}
            <Text style={styles.sectionHeading}>Beginner Tips</Text>
            <Text style={styles.sectionText}>
              1. Start with well-known cryptocurrencies like Bitcoin or Ethereum.{"\n"}
              2. Use reputable exchanges such as Coinbase, Binance, Kraken, etc.{"\n"}
              3. Never share your private keys or seed phrases with anyone.{"\n"}
              4. Diversify — don’t put all your money into a single coin.{"\n"}
              5. Only invest money you’re willing to lose — crypto can be volatile.{"\n"}
              6. Prefer long-term holding rather than day trading as a beginner.
            </Text>

            {/* Risks */}
            <Text style={styles.sectionHeading}>Risks & Volatility</Text>
            <Text style={styles.sectionText}>
              Cryptocurrency prices can rise and fall drastically in short periods.  
              It is important to understand that high potential returns usually come with 
              high levels of risk. Network hacks, scams, and human error (like losing your wallet) 
              are also real dangers. Always research before investing.
            </Text>

            {/* FAQ */}
            <Text style={styles.sectionHeading}>FAQ</Text>
            <Text style={styles.sectionText}>
              <Text style={{ fontWeight: "700" }}>Q: Is cryptocurrency legal?</Text>{"\n"}
              A: In most countries, yes — but regulations vary. Always check your local laws.{"\n\n"}

              <Text style={{ fontWeight: "700" }}>Q: Do I need a bank account?</Text>{"\n"}
              A: No. Crypto is independent of banks, but many exchanges require verification.{"\n\n"}

              <Text style={{ fontWeight: "700" }}>Q: Can I lose my crypto?</Text>{"\n"}
              A: Yes — if you lose your private keys, fall for scams, or invest irresponsibly.{"\n\n"}

              <Text style={{ fontWeight: "700" }}>Q: Which crypto should I buy first?</Text>{"\n"}
              A: Bitcoin and Ethereum are the most stable starting points for beginners.
            </Text>

            {/* Close Button */}
            <TouchableOpacity
              onPress={() => setCryptoModalVisible(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>

          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
  loadingContainer: { flex: 1, backgroundColor: "#050609", justifyContent: "center", alignItems: "center" },
  loadingText: { color: "#fff" },
  premiumContainer: { flex: 1, backgroundColor: "#050609", justifyContent: "center", alignItems: "center", paddingHorizontal: 24 },
  premiumText: { color: "#fff", fontSize: 20, textAlign: "center", fontWeight: "600" },
  sectionTitle: { color: "#CFF008", fontSize: 20, fontWeight: "700", marginBottom: 16, marginLeft: 4 },
  courseItem: { backgroundColor: "#050609", borderWidth: 1, borderColor: "#55610eff", borderRadius: 14, padding: 18, marginBottom: 16, flexDirection: "row", alignItems: "center" },
  courseTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "600" },
  modalContainer: { flex: 1, backgroundColor: "#050609", padding: 20 },
  modalTitle: { fontSize: 26, fontWeight: "700", color: "#CFF008", marginBottom: 16 },
  courseImage: { width: "100%", height: 200, resizeMode: "contain", marginBottom: 20 },
  sectionHeading: { fontSize: 20, fontWeight: "700", color: "#CFF008", marginTop: 16, marginBottom: 8 },
  sectionText: { fontSize: 16, color: "#FFFFFF", lineHeight: 24 },
  closeButton: { marginTop: 30, backgroundColor: "#CFF008", paddingVertical: 14, borderRadius: 14, alignItems: "center" },
  closeButtonText: { color: "#131313", fontWeight: "700", fontSize: 18 },
  modalHeader: {alignItems: "center", marginBottom: 16,},
  modalHeaderText: {fontSize: 24, fontWeight: "700", color: "#FFFFFF",},
  modalHeaderLine: {marginTop: 4, width: "100%", height: 3, backgroundColor: "#CFF008", borderRadius: 2, },
});