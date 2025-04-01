import { createApp } from "vue";
import App from "./App.vue";
import "./style.css";
import { Capacitor } from "@capacitor/core";

const app = createApp(App);

if (Capacitor.isNativePlatform()) {
  document.addEventListener(
    "deviceready",
    () => {
      app.mount("#app");
    },
    false
  );
} else {
  app.mount("#app");
}
