import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {jwtDecode} from "jwt-decode";

const ProtectedRoute = ({ children, requiredPermission, permissionLevel }) => {
    const token = useSelector(state => state.auth.token);
    const permission = useSelector(state => state.auth.permission);
    const isAdmin = useSelector(state => state.auth.isAdmin);

    // 1. JWT 토큰이 없으면 로그인 페이지로 리디렉트
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    try {
        // 2. JWT 토큰 디코딩
        const decoded = jwtDecode(token);

        // 3. JWT 토큰이 만료되었으면 로그인 페이지로 리디렉트
        if (decoded.exp * 1000 < Date.now()) {
            // 만료된 토큰 및 권한 정보 삭제
            localStorage.removeItem('token');
            localStorage.removeItem('permission');
            return <Navigate to="/login" replace />;
        }

        // 4. 사용자가 필요한 권한을 가지고 있지 않다면 권한 없음 페이지로 리디렉트
        if (requiredPermission) {
            const userPermission = permission[requiredPermission];

            if (isAdmin) {
                return children;  // 관리자인 경우 모든 접근 허용
            }

            const hasPermission =
                (permissionLevel === 'ADMIN' && userPermission === 'ADMIN') ||
                (permissionLevel === 'GENERAL' && (userPermission === 'ADMIN' || userPermission === 'GENERAL'));

            if (!hasPermission) {
                return (
                    <Navigate
                        to="/unauthorized"
                        replace
                        state={{
                            permissionLevel,
                            userPermission
                        }}
                    />
                );
            }
        }

    } catch (e) {
        // 5. JWT 토큰이 유효하지 않거나 오류가 있으면 로그인 페이지로 리디렉트
        localStorage.removeItem('token');
        localStorage.removeItem('permission');
        localStorage.removeItem('isAdmin');
        return <Navigate to="/login" replace />;
    }

    // 6. 유효한 JWT 토큰과 권한이 있으면 페이지를 렌더링
    return children;
};

export default ProtectedRoute;