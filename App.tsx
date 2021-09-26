import { ThemeProvider } from "@shopify/restyle";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "react-query";

import useCachedResources from "./hooks/useCachedResources";
import useColorScheme from "./hooks/useColorScheme";
import { lightTheme, darkTheme } from "./lib/theme";
import Navigation from "./navigation";

const queryClient = new QueryClient();

export default function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();

  if (!isLoadingComplete) return null;

  return (
    <ThemeProvider theme={colorScheme === "dark" ? darkTheme : lightTheme}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <Navigation colorScheme={colorScheme} />
          <StatusBar />
        </SafeAreaProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
