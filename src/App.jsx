import './styles/App.css';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { themeSettings } from './config/AppUtil.jsx';
import React, {useEffect, useRef, useState} from 'react';
import { CssBaseline, Box } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Cookies from 'js-cookie'; // 쿠키 사용
import ContentWrapper from './modules/common/main_content/ContentWrapper.jsx';
import Sidebar from './components/Sidebar.jsx';
import MainContentPage from './modules/common/main_content/MainContentPage.jsx';
import Headers from './components/Headers.jsx';
import { Layout } from "antd";
import LoginPage from "./modules/common/login/LoginPage.jsx";
import ProtectedRoute from "./config/ProtectedRoute.jsx"; // 쿠키 기반 보호 경로
import { setAuth } from "./config/redux/authSlice.jsx";
import {useDispatch, useSelector} from "react-redux";
import { subMenuItems } from './config/menuItems.jsx';
import RegisterPage from "./modules/common/register/RegisterPage.jsx";
import { notification } from 'antd';
import { NotificationProvider, useNotificationContext } from "./config/NotificationContext.jsx";
import { jwtDecode } from "jwt-decode";
import UnauthorizedPage from "./modules/common/unauthorized/UnauthorizedPage.jsx";
import {COMMON_API} from "./config/apiConstants.jsx";
import apiClient from "./config/apiClient.jsx";

const { Sider, Content } = Layout;
const theme = createTheme(themeSettings);

const AppContent = () => {
    const { token, isAdmin, permission, companyId } = useSelector((state) => state.auth);
    const notify = useNotificationContext();
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();


    useEffect(() => {
        if (location.state?.login) {
            notify('success', '로그인 성공', '환영합니다! 메인 페이지로 이동했습니다.', 'top');
            navigate('/integration', { replace: true, state: {} });
        }
    }, [location.state, notify]);


    const renderRoutes = () => {
        if (!subMenuItems) {
            return null; // subMenuItems가 로드될 때까지는 아무것도 렌더링하지 않음
        }

        const routes = [];
        // 모든 메뉴와 서브메뉴 항목을 순회하면서 동적 라우트를 설정
        for (const mainMenu in subMenuItems) {
            subMenuItems[mainMenu].forEach((subMenu) => {
                // 소분류 항목이 없는 경우 바로 경로 설정
                if (!subMenu.items) {
                    routes.push(
                        <Route
                            key={subMenu.url}
                            path={subMenu.url}
                            element={
                                <ProtectedRoute
                                    requiredPermission={subMenu.requiredPermission}
                                    permissionLevel={subMenu.permissionLevel}
                                >
                                    <MainContentPage selectedSubSubMenu={subMenu} />
                                </ProtectedRoute>
                            }
                        />
                    );
                } else {
                    // 소분류가 있는 경우 기존 방식대로 처리
                    subMenu.items.forEach((subSubItem) => {
                        routes.push(
                            <Route
                                key={subSubItem.url}
                                path={subSubItem.url}
                                element={
                                    <ProtectedRoute
                                        requiredPermission={subSubItem.requiredPermission}
                                        permissionLevel={subSubItem.permissionLevel}
                                    >
                                        <MainContentPage selectedSubSubMenu={subSubItem} />
                                    </ProtectedRoute>
                                }
                            />
                        );
                    });
                }
            });
        }

        return routes;
    };

    // 로그인 전에는 LoginPage 또는 RegisterPage로만 이동 가능
    if (!token) {
        return (
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        );
    }

    return (
        <>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/unauthorized" element={<UnauthorizedPage />} />
                {/* 로그인 후에는 메인 레이아웃으로 이동 */}
                <Route
                    path="/*"
                    element={
                        <Layout style={{ minHeight: '100vh' }}>
                            <Layout>
                                <Sider className="custom-sidebar">
                                    <Sidebar />
                                </Sider>
                                <Box  style={{ width: '100%' }}>
                                <Headers />
                                <Content style={{ transition: 'margin-left 0.3s ease' }}>
                                    <Box sx={{ overflowY: 'auto', height: 'calc(100vh - 64px)', backgroundColor: '#fff' }}>
                                        <ContentWrapper>
                                            <Routes>
                                                <Route
                                                    path="/"
                                                    element={
                                                        <ProtectedRoute>
                                                            <Navigate to="/integration" replace />
                                                        </ProtectedRoute>
                                                    }
                                                />

                                                {/* 동적으로 라우트들을 렌더링 */}
                                                {renderRoutes().map((route) => (
                                                    <Route
                                                        key={route.key}
                                                        path={route.props.path}
                                                        element={
                                                            <ProtectedRoute>
                                                                {route.props.element}
                                                            </ProtectedRoute>
                                                        }
                                                    />
                                                ))}

                                                {/* 정의되지 않은 경로는 메인 페이지로 리다이렉트 */}
                                                <Route
                                                    path="*"
                                                    element={<Navigate to="/integration" replace />}
                                                />
                                            </Routes>
                                        </ContentWrapper>
                                    </Box>
                                </Content>
                                </Box>
                            </Layout>
                        </Layout>
                    }
                />
            </Routes>
        </>
    );
};

const App = () => {

    useEffect(() => {
        notification.config({
            duration: 1,
        });
    }, []);


    return (
        <NotificationProvider>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Router>
                    <AppContent />
                </Router>
            </ThemeProvider>
        </NotificationProvider>
    );
};

export default App;