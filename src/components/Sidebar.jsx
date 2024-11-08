import React, { useEffect, useRef, useState } from 'react';
import { Box, Grid, Grow } from '@mui/material';
import {Layout, Menu, Typography} from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/App.css';
import { menuItems, subMenuItems } from '../config/menuItems.jsx';
import {useDispatch, useSelector} from "react-redux";
import openKeys from "lodash";
import {setSelectedMenu, setSelectedSubMenu, setSelectedSubSubMenu} from "../config/redux/menuSlice.jsx";
import LogoWhite from "../assets/favicon/OMZ_white.svg";

const { Sider } = Layout;

const Sidebar = () => {
    const [openKeys, setOpenKeys] = useState([]); // 현재 열려있는 메뉴 키 관리
    const [hovering, setHovering] = useState(false); // 사이드바가 호버 상태인지 관리
    const [selectedKey, setSelectedKey] = useState(''); // 선택된 메뉴 키 관리
    const navigate = useNavigate();
    const location = useLocation(); // 현재 URL 경로 가져오기
    const dispatch = useDispatch();

    // Redux에서 선택된 메뉴 상태 가져오기
    const { selectedMenu, selectedSubMenu, selectedSubSubMenu } = useSelector((state) => state.menu);


    const handleLogoClick = () => {
        navigate('/integration');
    };

    useEffect(() => {
        const path = location.pathname;
        let openKey = '';
        let newSelectedKey = '';

        // URL과 일치하는 메뉴 항목을 찾아서 openKeys 및 selectedKey 설정
        menuItems.forEach((item, index) => {
            const mainKey = `sub${index + 1}`;

            subMenuItems[item.text]?.forEach((subItem, subIndex) => {
                const subKey = `${mainKey}-${subIndex + 1}`;

                // 소분류가 없는 중분류 메뉴 처리
                if (!subItem.items && subItem.url === path) {
                    openKey = subKey;
                    newSelectedKey = subKey;

                    // Redux 상태 업데이트
                    dispatch(setSelectedMenu(item.text));
                    dispatch(setSelectedSubMenu(subItem.text));
                    dispatch(setSelectedSubSubMenu(subItem));
                }

                // 소분류가 있는 메뉴 처리
                subItem.items?.forEach((subSubItem, subSubIndex) => {
                    const subSubKey = `${subKey}-${subSubIndex + 1}`;
                    if (subSubItem.url === path) {
                        openKey = subKey;
                        newSelectedKey = subSubKey;

                        // Redux 상태 업데이트
                        dispatch(setSelectedMenu(item.text));
                        dispatch(setSelectedSubMenu(subItem.text));
                        dispatch(setSelectedSubSubMenu(subSubItem));
                    }
                });
            });
        });

        if (openKey && newSelectedKey) {
            setOpenKeys([openKey]); // openKeys를 배열로 설정
            setSelectedKey(newSelectedKey); // 선택된 키 업데이트
        }
    }, [location, dispatch]);

    // 메뉴 클릭 시 처리
    const handleClick = (subSubItem, subSubKey) => {
        if (subSubItem?.url) {
            navigate(subSubItem.url);

            // 클릭 시 Redux 상태 업데이트
            dispatch(setSelectedSubSubMenu(subSubItem));
            setSelectedKey(subSubKey); // 선택된 키 업데이트
        }
    };

    // 메뉴가 열릴 때 처리
    const handleOpenChange = (keys) => {
        setOpenKeys(keys); // 현재 열린 메뉴 상태를 업데이트
    };

    // 마우스가 사이드바 위에 있을 때 이벤트 처리
    const handleMouseEnter = () => {
        setHovering(true);

        // 호버 시 현재 선택된 메뉴의 상위 카테고리를 모두 엶
        if (selectedKey) {
            // 상위 카테고리 키를 포함한 openKeys 구성
            const parentKeys = selectedKey.split('-').slice(0, -1); // 부모 키 추출
            const newOpenKeys = parentKeys.reduce((acc, key, idx) => {
                const combinedKey = parentKeys.slice(0, idx + 1).join('-'); // 각 상위 카테고리까지의 키 조합
                return [...acc, combinedKey];
            }, []);
            setOpenKeys(newOpenKeys); // 상위 카테고리를 포함한 openKeys 설정
        }
    };

    // 마우스가 사이드바를 떠났을 때 이벤트 처리
    const handleMouseLeave = () => {
        setHovering(false);
        setOpenKeys([]); // 모든 메뉴 닫기
    };

    // 메뉴 구성
    const menuItemsWithSubMenu = menuItems.map((item, index) => ({
        key: `sub${index + 1}`,
        icon: item.icon,
        label: item.text,
        children: subMenuItems[item.text]?.map((subItem, subIndex) => {
            // 하위 항목이 없는 경우 바로 클릭 가능하도록 처리
            if (!subItem.items) {
                return {
                    key: `sub${index + 1}-${subIndex + 1}`,
                    label: (
                        <div
                            onClick={() => handleClick(subItem, `sub${index + 1}-${subIndex + 1}`)}
                            style={{ cursor: 'pointer' }}
                        >
                            {subItem.text}
                        </div>
                    )
                };
            }

            // 하위 항목이 있는 경우 처리
            return {
                key: `sub${index + 1}-${subIndex + 1}`,
                label: subItem.text,
                children: subItem.items.map((subSubItem, subSubIndex) => ({
                    key: `sub${index + 1}-${subIndex + 1}-${subSubIndex + 1}`,
                    label: (
                        <div
                            onClick={() => handleClick(subSubItem, `sub${index + 1}-${subIndex + 1}-${subSubIndex + 1}`)}
                            style={{ cursor: 'pointer' }}
                        >
                            {subSubItem.text}
                        </div>
                    )
                }))
            };
        })
    }));

    return (
        <Sider
            className="custom-sidebar"
            theme={'dark'}
            onMouseEnter={handleMouseEnter} // 마우스가 사이드바에 들어왔을 때
            onMouseLeave={handleMouseLeave} // 마우스가 사이드바에서 떠났을 때
        >
            <Box style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '64px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis' }}>
                {hovering ? (
                    <Typography onClick={handleLogoClick}>
                        Think Global, Act Local
                    </Typography>
                ) : (
                        <img onClick={handleLogoClick} src={LogoWhite} alt={'logo'} style={{ width: '50px'}} />
                )}
            </Box>
            <Menu
                mode="inline"
                theme={'dark'}
                selectedKeys={[selectedKey]} // 선택된 메뉴 항목 설정
                openKeys={hovering ? openKeys : []} // 현재 열려있는 메뉴 설정
                onOpenChange={handleOpenChange} // 메뉴 토글
                items={menuItemsWithSubMenu} // 메뉴 아이템
                style={{ height: 'calc(100vh - 64px)', overflowY: 'auto', borderRight: 0 }}
            />
        </Sider>
    );
};

export default Sidebar;