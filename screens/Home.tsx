import * as React from "react";
import { Pressable, StyleSheet } from "react-native";

import EditScreenInfo from "../components/EditScreenInfo";
import { Text, View } from "../components/Themed";
import { RootTabScreenProps } from "../types";
import * as Location from "expo-location";
import { useEffect, useLayoutEffect, useState, useCallback } from "react";
import { Query, useQuery } from "react-query";
import { useNavigation } from "@react-navigation/core";
import { FontAwesome } from "@expo/vector-icons";
import Colors from "../constants/Colors";
import useColorScheme from "../hooks/useColorScheme";

export default function HomeScreen({ navigation }: RootTabScreenProps<"Home">) {
  const [location, setLocation] = useState<Location.LocationObject>();
  const [errorMsg, setErrorMsg] = useState<string>();
  const colorScheme = useColorScheme();

  const refreshLocation = useCallback(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});

      setLocation(location);
    })();
  }, [setLocation]);

  useEffect(() => {
    refreshLocation();
  }, []);

  const forecast = useQuery(
    [
      "forecast",
      location?.timestamp,
      location?.coords.latitude,
      location?.coords.longitude,
    ],
    async () => {
      if (
        typeof location?.coords.latitude !== "number" ||
        typeof location?.coords.longitude !== "number"
      )
        return undefined;
      const response = await fetch(
        `https://meteo-api.vercel.app/api/forecasts?latitude=${location?.coords.latitude}&longitude=${location?.coords.longitude}`
      );
      if (!response.ok) throw new Error("Network response was not ok");

      return await response.json();
    }
  );

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () =>
        forecast.isFetching ? null : (
          <Pressable
            onPress={() => refreshLocation()}
            style={({ pressed }) => ({
              opacity: pressed ? 0.5 : 1,
            })}
          >
            <FontAwesome
              name="refresh"
              size={25}
              color={Colors[colorScheme].text}
              style={{ marginLeft: 15 }}
            />
          </Pressable>
        ),
    });
  }, [navigation, forecast.isFetching]);

  useEffect(() => {
    if (typeof forecast.data?.position?.name === "string")
      navigation.setOptions({ title: forecast.data?.position?.name });
  }, [navigation, forecast.data?.position?.name]);

  return (
    <View style={styles.container}>
      {forecast.data != null && (
        <>
          <Text style={styles.title}>{forecast.data.forecast[0].T.value}°</Text>
          <View
            style={styles.separator}
            lightColor="#eee"
            darkColor="rgba(255,255,255,0.1)"
          />
          <Text
            style={styles.getStartedText}
            lightColor="rgba(0,0,0,0.8)"
            darkColor="rgba(255,255,255,0.8)"
          >
            {forecast.data.forecast[0].weather.desc}
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
  getStartedText: {
    fontSize: 17,
    lineHeight: 24,
    textAlign: "center",
  },
});
