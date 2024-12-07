// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
//
// const ProtectedPage = () => {
//     const [isAuthenticated, setIsAuthenticated] = useState(false);
//     const navigate = useNavigate();
//
//     useEffect(() => {
//         const token = localStorage.getItem("access_token");
//         if (token) {
//             // TODO: 토큰 유효성 검증 로직 추가
//             setIsAuthenticated(true); // 임시로 true 설정
//         } else {
//             navigate("/login"); // 토큰 없으면 로그인 페이지로 리디렉션
//         }
//     }, [navigate]);
//
//     if (!isAuthenticated) {
//         return <div>접근 권한이 없습니다.</div>;
//     }
//
//     return <div>보호된 페이지 내용</div>;
// };
//
// export default ProtectedPage;
