
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Simulator from './pages/Simulator';
import Store from './pages/Store';
import About from './pages/About';
import Support from './pages/Support';
import Docs from './pages/Docs';
import Courses from './pages/Courses';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ProductDetails from './pages/ProductDetails';
import CourseDetails from './pages/CourseDetails';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="simulator" element={<Simulator />} />
          <Route path="courses" element={<Courses />} />
          <Route path="courses/:id" element={<CourseDetails />} />
          <Route path="store" element={<Store />} />
          <Route path="store/product/:id" element={<ProductDetails />} />
          <Route path="about" element={<About />} />
          <Route path="support" element={<Support />} />
          <Route path="docs" element={<Docs />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
