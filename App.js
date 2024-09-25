import { StatusBar } from "expo-status-bar";
import { Alert, Button, Platform, StyleSheet, View } from "react-native";
import * as Notifications from "expo-notifications";
import { useState, useEffect } from "react";

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowAlert: true,
    };
  },
});

export default function App() {
  const [pushToken, setPushToken] = useState(null);

  useEffect(() => {
    async function configurePushNotifications() {
      const { status } = await Notifications.getPermissionsAsync();
      let finalStatus = status;

      if (finalStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        Alert.alert(
          "Permission Required!",
          "This App requires permission to push notifications!"
        );
        return;
      }

      const pushTokenData = await Notifications.getExpoPushTokenAsync({
        projectId: "f6527624-3e91-4d9c-9729-71c2881b8fd4", 
      });

     
      console.log(pushTokenData.data);
      setPushToken(pushTokenData.data); 
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.HIGH,
        vibration: [0, 250, 250, 250],
      });
    }

    configurePushNotifications();
  }, []);

  const sendPushNotificationHandler = async () => {
    if (!pushToken) {
      Alert.alert("No Push Token", "Push token is not available. Please try again.");
      return;
    }

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: 'ExponentPushToken[EQSz0YKRbvjBcYc24S4Rv8]',
        title: 'Test - sent from Android Emu',
        body: 'This is a test',
      }),
    });

    const data = await response.json();
    console.log("Notification response:", data);
  };

  useEffect(() => {
    const subscription1 = Notifications.addNotificationReceivedListener((notification) => {
      console.log("Notification received");
      console.log(notification.request.content.data.userName);
    });

    const subscription2 = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("Notification response:", response);
    });

    return () => {
      
      subscription1.remove();
      subscription2.remove();
    };
  }, []);

  const scheduleNotificationHandler = () => {
    Notifications.scheduleNotificationAsync({
      content: {
        title: "First Local Notification",
        body: "Body of notification",
        data: { userName: "Sohaib" },
      },
      trigger: {
        seconds: 2,
      },
    });
  };

  return (
    <>
      <View style={styles.container}>
        <Button
          title="Schedule Notification"
          onPress={scheduleNotificationHandler}
        />
        <Button title="Push Notification" onPress={sendPushNotificationHandler} />
      </View>
      <StatusBar style="auto" />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    gap: 15,
  },
});
