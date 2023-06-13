import RootLayout from '@layout/Default/Default';
import HomePage from "@template/HomePage/HomePage";
import Header from "@module/Header/Header";

const App = () => (
  <RootLayout>
    <Header/>
    <HomePage />
  </RootLayout>
);

export default App;