import _app from "./components/_app/_app";
import "./App.css";
import { CurrencyProvider } from "./components/currencyProvider/CurrencyProvider";

function App() {
  return (
    <CurrencyProvider>
      <_app />
    </CurrencyProvider>
  );
}

export default App;
