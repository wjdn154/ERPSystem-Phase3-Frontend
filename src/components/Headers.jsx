import React, {useEffect, useRef, useState} from 'react';
import {Tag, Menu, List, Badge, Layout, Row, Col, Avatar, Dropdown, Button, notification, Tooltip} from 'antd';
import { useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../config/redux/authSlice.jsx";
import {UserOutlined, DownOutlined, LogoutOutlined, BellOutlined} from '@ant-design/icons';
import apiClient from "../config/apiClient.jsx";
import {COMMON_API} from "../config/apiConstants.jsx";
import {jwtDecode} from "jwt-decode";
import {useNotificationContext} from "../config/NotificationContext.jsx";

const { Header } = Layout;

function Headers() {
    const notify = useNotificationContext();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { token, isAdmin, userNickname } = useSelector((state) => state.auth);
    const eventSourceRef = useRef(null);
    const [notificationItems, setNotificationItems] = useState([]);
    const [employeeId, setEmployeeId] = useState(null);
    const [tenantId, setTenantId] = useState(null);
    const [module, setModule] = useState(null);
    const [permissionLevel, setPermissionLevel] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (token) {
            const decodedToken = jwtDecode(token);
            setEmployeeId(decodedToken.employeeId);
            setTenantId(`tenant_${decodedToken.companyId}`);

            const initializeSSE = async () => {
                try {
                    const response = await apiClient.post(COMMON_API.GET_USER_SUBSCRIPTION_INFO_API(decodedToken.employeeId, isAdmin));

                    if (response) {
                        setModule(response.data.module);
                        setPermissionLevel(response.data.permission);

                        const createEventSource = () => {
                            let reconnectAttempts = 0; // 재연결 시도 횟수
                            let reconnectInterval = 1000; // 초기 재연결 간격 (1초)

                            const connect = () => {
                                eventSourceRef.current = new EventSource(COMMON_API.NOTIFICATION_SUBSCRIBE_API(
                                    decodedToken.employeeId,
                                    decodedToken["X-Tenant-ID"],
                                    module,
                                    permissionLevel
                                ));

                                eventSourceRef.current.addEventListener("subscribe", async (event) => {
                                    console.log("SSE 구독 성공:", event.data);
                                    try {
                                        const response2 = await apiClient.post(COMMON_API.CREATE_NOTIFICATION_API(decodedToken.employeeId, module, permissionLevel));
                                        setNotificationItems(response2.data);
                                        setUnreadCount(response2.data.filter((item) => !item.readStatus).length);
                                        reconnectAttempts = 0; // 성공하면 재연결 시도 횟수 초기화
                                        reconnectInterval = 1000; // 재연결 간격 초기화
                                    } catch (error) {
                                        console.error("알림 목록 조회 에러:", error);
                                    }
                                });

                                eventSourceRef.current.addEventListener("notification", async (event) => {
                                    notify('info', "알림", event.data, 'topRight');
                                    setTimeout(async () => {
                                        try {
                                            const response2 = await apiClient.post(COMMON_API.CREATE_NOTIFICATION_API(decodedToken.employeeId, module, permissionLevel));
                                            setNotificationItems(response2.data);
                                            setUnreadCount(response2.data.filter((item) => !item.readStatus).length);
                                        } catch (error) {
                                            console.error("알림 생성 에러:", error);
                                        }
                                    }, 300);
                                });

                                eventSourceRef.current.onerror = () => {
                                    console.error("SSE 연결 끊김. 재연결 시도 중...");
                                    eventSourceRef.current.close();
                                    eventSourceRef.current = null;

                                    if (reconnectAttempts < 10) { // 최대 10회 재연결 시도
                                        reconnectAttempts++;
                                        reconnectInterval = Math.min(reconnectInterval * 2, 30000); // 재연결 간격을 최대 30초로 제한
                                        setTimeout(connect, reconnectInterval);
                                    } else {
                                        notify('error', "알림", "서버와의 연결이 불안정합니다. 관리자에게 문의하세요.", 'topRight');
                                    }
                                };
                            };

                            connect();
                        };

                        createEventSource();
                    }
                } catch (error) {
                    console.error("사용자 정보 조회 에러:", error);
                }
            };

            initializeSSE();

            return () => {
                if (eventSourceRef.current) {
                    eventSourceRef.current.close();
                    eventSourceRef.current = null;

                    try {
                        apiClient.post(COMMON_API.NOTIFICATION_UNSUBSCRIBE_API, {
                            employeeId: decodedToken.employeeId,
                        });
                    } catch (error) {
                        console.error("구독 해제 에러:", error);
                    }
                }
            };
        }
    }, [token, isAdmin, dispatch]);

    const handleNotificationClick = async () => {
        try {
            const response = await apiClient.post(
                COMMON_API.CREATE_NOTIFICATION_API(employeeId, module, permissionLevel)
            );
            setNotificationItems(response.data);
            setUnreadCount(response.data.filter((item) => !item.readStatus).length);
        } catch (error) {
            console.error("사용자 정보 조회 에러:", error);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            const response = await apiClient.post(COMMON_API.MARK_AS_READ_NOTIFICATION_API(employeeId, notificationId));
            setNotificationItems((prevItems) =>
                prevItems.map((item) =>
                    item.notification.id === notificationId ? { ...item, readStatus: true } : item
                )
            );
            setUnreadCount((prevCount) => {
                const item = notificationItems.find((item) => item.notification.id === notificationId);
                return item && !item.readStatus ? prevCount - 1 : prevCount;
            });
        } catch (error) {
            console.error('알림 읽음 처리 에러:', error);
        }
    };

    const handleProfile = () => {
        notification.error({
            message: '미구현 기능',
            description: (
                <>
                    이 기능은 현재 준비 중입니다.<br />
                    추가 정보나 업데이트는{' '}
                    <a href="https://github.com/wjdn154/ERPSystem" target="_blank" rel="noopener noreferrer">
                        여기를 클릭
                    </a>
                    에서 확인하실 수 있습니다.
                </>
            ),
            placement: 'top',
        });
    };

    const handleLogout = () => {
        try {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
            apiClient.post(COMMON_API.NOTIFICATION_UNSUBSCRIBE_API, {
                employeeId: jwtDecode(token).employeeId,
            }).then(() => {
                Cookies.remove('jwt');
                dispatch(logout());
                navigate('/login');
            });
        } catch (error) {
            console.error("구독 해제 에러:", error);
        }
    };

    const userMenuItems = [
        {
            key: 'profile',
            label: '프로필',
            icon: <UserOutlined />,
            onClick: handleProfile,
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            label: '로그아웃',
            icon: <LogoutOutlined />,
            onClick: handleLogout,
        },
    ];

    return (
        <Header style={styles.header}>
            <Row align="middle" style={styles.row}>
                <Col style={{ cursor: 'pointer', marginRight: '30px' }}>
                    <Dropdown
                        dropdownRender={() => (
                            <div className="notification-dropdown">
                                <List
                                    itemLayout="horizontal"
                                    dataSource={notificationItems.length ? notificationItems : [{ key: 'no-notifications', content: '알림이 없습니다', readStatus: true }]}
                                    renderItem={(notification) => (
                                        <List.Item
                                            key={notification.key || notification.notification.id}
                                            className={`notification-item ${notification.readStatus ? 'read' : 'unread'}`}
                                            onClick={() => !notification.key && markAsRead(notification.notification.id)}
                                        >
                                            <List.Item.Meta
                                                avatar={
                                                    <Avatar
                                                        style={{
                                                            backgroundColor: notification.readStatus ? '#d9d9d9' : '#1890ff',
                                                        }}
                                                        icon={<BellOutlined />}
                                                    />
                                                }
                                                title={
                                                    <span className="notification-title">
                                                        {notification.type ? notification.type.replace('_', ' ') : '알림이 없습니다'}
                                                        {notification.module ? <Tooltip title="알림을 받을 대상의 부서 입니다.">
                                                            <Tag style={{ marginLeft: '20px' }} color={notification.readStatus ? 'default' : 'green'}>{notification.module}</Tag>
                                                        </Tooltip> : null}
                                                        {notification.module ? <Tooltip title="알림을 받을 대상의 권한 입니다.">
                                                            <Tag color={notification.readStatus ? 'default' : 'red'}>{notification.permission}</Tag>
                                                        </Tooltip> : null}
                                                    </span>
                                                }
                                                description={
                                                    <div className="notification-description">
                                                        <span className="notification-content">
                                                            {notification.content || '내용이 없습니다.'}
                                                        </span>
                                                        {notification.createAt && (
                                                            <span className="notification-timestamp"><br />{new Date(notification.createAt).toLocaleString()}</span>
                                                        )}
                                                    </div>
                                                }
                                            />
                                        </List.Item>
                                    )}
                                />
                            </div>
                        )}
                        trigger={['click']}
                        onOpenChange={(open) => {
                            if (open) handleNotificationClick();
                        }}
                    >
                        <Badge count={unreadCount} offset={[0, 1]}>
                            <BellOutlined style={{ fontSize: '20px', color: '#000', cursor: 'pointer' }} />
                        </Badge>
                    </Dropdown>
                </Col>
                <Col>
                    {userNickname ? (
                        <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
                            <div style={styles.userSection}>
                                <Avatar style={styles.avatar} icon={<UserOutlined />} />
                                <span style={styles.userNickname}>{userNickname}</span>
                                <DownOutlined style={styles.downIcon} />
                            </div>
                        </Dropdown>
                    ) : (
                        <Button type="primary" onClick={() => navigate('/login')}>
                            로그인
                        </Button>
                    )}
                </Col>
            </Row>
        </Header>
    );
}

const styles = {
    header: {
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backgroundColor: '#fff',
        padding: '0 24px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        boxShadow: 'rgba(0, 0, 0, 0.1) 0px 1px 4px',
    },
    row: {
        width: '100%',
        display: 'flex',
        justifyContent: 'flex-end',
    },
    userSection: {
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
    },
    userNickname: {
        marginLeft: '8px',
        marginRight: '8px',
        fontWeight: 'bold',
        color: '#000',
    },
    downIcon: {
        color: '#000',
    },
    avatar: {
        backgroundColor: '#1890ff',
    },
};

export default Headers;