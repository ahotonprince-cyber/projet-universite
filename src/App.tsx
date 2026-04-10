import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./router";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { FaUser } from "react-icons/fa"

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <AppRoutes />
      </BrowserRouter>
    </I18nextProvider>
  );
}

export default App;
