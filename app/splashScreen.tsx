import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
// Ya no necesitamos useRouter ni useEffect aquí, el control está en index.js

// Colores basados en tu diseño
const ACCENT_COLOR = "#FFC700"; // Dorado/Amarillo para el texto "Aureum"
const LOGO_PATH = require('../assets/images/logo2.png'); // 🚨 IMPORTANTE: Asume que la imagen está en 'assets'
const BG_COLOR = "#050609"; // Azul oscuro/negro del diseño (un poco diferente al #0A0A0A)

export default function SplashScreen() {
  
  return (
    <View style={styles.container}>
      {/* Tu logo Aureum */}
      <Image
        style={styles.logo}
        source={LOGO_PATH}
        // Asegúrate de reemplazar `../assets/image_38597d.png` con la ruta correcta si es diferente.
      />
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 220,
    height: 220,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  appName: {
    fontSize: 30,
    fontWeight: 'bold',
    color: ACCENT_COLOR,
    // Sombra sutil para darle un toque brillante (efecto "glow")
    marginTop: 150,
    marginBottom: -100,
  },
  loadingIndicator: {
    marginTop: 20,
  }
});