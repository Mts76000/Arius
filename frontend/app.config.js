const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

module.exports = {
  expo: {
    name: "Arius",
    slug: "arius",
    version: "1.0.0",
    orientation: "default",
    icon: "./assets/images/icon.png",
    scheme: "arius",
    userInterfaceStyle: "automatic",
    newArchEnabled: false,
    ios: {
      supportsTablet: true,
    },
    android: {
      package: "com.arius.app",
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
      bundler: "metro",
    },
    plugins: [],
    experiments: {
      typedRoutes: false,
      reactCompiler: false,
    },
    extra: {
      apiUrl,
      eas: {
        projectId: "93e70fda-13c9-4f6b-bb6b-64aaa03339bf",
      },
    },
  },
};
